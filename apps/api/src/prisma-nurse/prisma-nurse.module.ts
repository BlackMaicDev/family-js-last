import { Module } from '@nestjs/common';
import { PrismaNurseService } from './prisma-nurse.service';

@Module({
  providers: [PrismaNurseService],
  exports: [PrismaNurseService],
})
export class PrismaNurseModule {}
