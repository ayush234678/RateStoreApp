import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  getStores(@Request() req, @Query() q: any) {
    return this.storesService.getStores(req.user.id, q);
  }

  @Get('my-dashboard')
  getOwnerDashboard(@Request() req) {
    return this.storesService.getStoreOwnerDashboard(req.user.id);
  }
}
