import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Store } from '../stores/store.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating) private ratingsRepo: Repository<Rating>,
    @InjectRepository(Store) private storesRepo: Repository<Store>,
  ) {}

  async submitRating(userId: number, storeId: number, ratingValue: number) {
    if (ratingValue < 1 || ratingValue > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const store = await this.storesRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');

    let rating = await this.ratingsRepo.findOne({ where: { store_id: storeId, user_id: userId } });
    if (rating) {
      rating.rating = ratingValue;
    } else {
      rating = this.ratingsRepo.create({ store_id: storeId, user_id: userId, rating: ratingValue });
    }
    return this.ratingsRepo.save(rating);
  }
}
