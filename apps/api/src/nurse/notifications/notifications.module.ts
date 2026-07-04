import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaNurseModule } from '../../prisma-nurse/prisma-nurse.module';

@Module({
  imports: [PrismaNurseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService]
})
export class NotificationsModule {}
