import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Store) private storesRepo: Repository<Store>,
    @InjectRepository(Rating) private ratingsRepo: Repository<Rating>,
  ) {}

  async getDashboard() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.usersRepo.count(),
      this.storesRepo.count(),
      this.ratingsRepo.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }

  async getUsers(filters: { name?: string; email?: string; address?: string; role?: string; sort?: string; order?: 'ASC' | 'DESC' }) {
    const qb = this.usersRepo.createQueryBuilder('u')
      .where('u.role IN (:...roles)', { roles: [UserRole.USER, UserRole.ADMIN] });

    if (filters.name) qb.andWhere('u.name LIKE :name', { name: `%${filters.name}%` });
    if (filters.email) qb.andWhere('u.email LIKE :email', { email: `%${filters.email}%` });
    if (filters.address) qb.andWhere('u.address LIKE :address', { address: `%${filters.address}%` });
    if (filters.role) qb.andWhere('u.role = :role', { role: filters.role });

    const sortField = ['name', 'email', 'address', 'role', 'created_at'].includes(filters.sort) ? filters.sort : 'name';
    qb.orderBy(`u.${sortField}`, filters.order || 'ASC');

    return qb.getMany();
  }

  async getUserById(id: number) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['store'] });
    if (!user) throw new NotFoundException('User not found');

    let averageRating = null;
    if (user.role === UserRole.STORE_OWNER && user.store) {
      const result = await this.ratingsRepo
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avg')
        .where('r.store_id = :storeId', { storeId: user.store.id })
        .getRawOne();
      averageRating = result?.avg ? parseFloat(result.avg).toFixed(2) : 0;
    }
    return { ...user, averageRating };
  }

  async createUser(dto: { name: string; email: string; password: string; address: string; role: UserRole }) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    const saved = await this.usersRepo.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async getStores(filters: { name?: string; email?: string; address?: string; sort?: string; order?: 'ASC' | 'DESC' }) {
    const qb = this.storesRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.ratings', 'r')
      .loadRelationCountAndMap('s.ratingCount', 's.ratings');

    if (filters.name) qb.andWhere('s.name LIKE :name', { name: `%${filters.name}%` });
    if (filters.email) qb.andWhere('s.email LIKE :email', { email: `%${filters.email}%` });
    if (filters.address) qb.andWhere('s.address LIKE :address', { address: `%${filters.address}%` });

    const sortField = ['name', 'email', 'address'].includes(filters.sort) ? filters.sort : 'name';
    qb.orderBy(`s.${sortField}`, filters.order || 'ASC');

    const stores = await qb.getMany();
    return stores.map(store => ({
      ...store,
      average_rating: store.ratings?.length
        ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(2))
        : 0,
      ratings: undefined,
    }));
  }

  async createStore(dto: { name: string; email: string; address: string; ownerEmail?: string }) {
    const exists = await this.storesRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Store email already registered');

    let owner_id = null;
    if (dto.ownerEmail) {
      const owner = await this.usersRepo.findOne({ where: { email: dto.ownerEmail, role: UserRole.STORE_OWNER } });
      if (owner) owner_id = owner.id;
    }

    const store = this.storesRepo.create({ name: dto.name, email: dto.email, address: dto.address, owner_id });
    return this.storesRepo.save(store);
  }
}
