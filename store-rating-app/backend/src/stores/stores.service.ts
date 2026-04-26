import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Store } from './store.entity';
import { Rating } from '../ratings/rating.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storesRepo: Repository<Store>,
    @InjectRepository(Rating) private ratingsRepo: Repository<Rating>,
    private dataSource: DataSource,
  ) {}

  async getStores(
    userId: number,
    filters: { name?: string; address?: string; sort?: string; order?: string },
  ) {
    const sortField = ['name', 'address'].includes(filters.sort) ? filters.sort : 'name';
    const sortOrder = filters.order === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT
        s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        MAX(CASE WHEN r.user_id = ? THEN r.rating ELSE NULL END) AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [userId];

    if (filters.name) { query += ' AND s.name LIKE ?'; params.push(`%${filters.name}%`); }
    if (filters.address) { query += ' AND s.address LIKE ?'; params.push(`%${filters.address}%`); }

    query += ` GROUP BY s.id ORDER BY s.${sortField} ${sortOrder}`;

    const rows = await this.dataSource.query(query, params);
    return rows.map((row: any) => ({
      ...row,
      average_rating: parseFloat(row.average_rating) || 0,
      user_rating: row.user_rating ? parseInt(row.user_rating) : null,
    }));
  }

  async getStoreOwnerDashboard(ownerId: number) {
    const store = await this.storesRepo.findOne({ where: { owner_id: ownerId } });
    if (!store) return { store: null, ratings: [], averageRating: 0 };

    const ratings = await this.ratingsRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .where('r.store_id = :storeId', { storeId: store.id })
      .orderBy('r.updated_at', 'DESC')
      .getMany();

    const avg = ratings.length
      ? parseFloat(
          (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(2),
        )
      : 0;

    return {
      store,
      ratings: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        updated_at: r.updated_at,
        user: { id: r.user?.id, name: r.user?.name, email: r.user?.email },
      })),
      averageRating: avg,
    };
  }
}
