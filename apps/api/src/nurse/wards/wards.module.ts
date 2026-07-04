import { Module } from '@nestjs/common';
import { WardsController } from './wards.controller';
import { WardsService } from './wards.service';
import { PrismaNurseModule } from '../../prisma-nurse/prisma-nurse.module';

@Module({
  imports: [PrismaNurseModule],
  controllers: [WardsController],
  providers: [WardsService]
})
export class WardsModule {}
