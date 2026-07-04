import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { PrismaCrocModule } from 'src/prisma-croc/prisma-croc.module';

@Module({
  imports: [PrismaCrocModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
