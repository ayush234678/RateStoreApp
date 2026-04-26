import {
  Controller, Post, Body, UseGuards,
  Request, ParseIntPipe, Param,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class SubmitRatingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post(':storeId')
  submitRating(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: SubmitRatingDto,
  ) {
    return this.ratingsService.submitRating(req.user.id, storeId, dto.rating);
  }
}
