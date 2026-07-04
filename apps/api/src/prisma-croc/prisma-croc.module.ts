import { Module } from '@nestjs/common';
import { PrismaCrocService } from './prisma-croc.service';

@Module({
  providers: [PrismaCrocService],
  exports: [PrismaCrocService],
})
export class PrismaCrocModule {}
