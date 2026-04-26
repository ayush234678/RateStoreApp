import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from './rating.entity';
import { Store } from '../stores/store.entity';
import { RolesGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Store])],
  controllers: [RatingsController],
  providers: [RatingsService, RolesGuard],
})
export class RatingsModule {}
