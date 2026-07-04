import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('nurse/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Query('nurseId') nurseId: string,
    @Query('isRead') isRead?: string,
  ) {
    return this.notificationsService.findAll(nurseId, isRead);
  }

  @Patch('read-all')
  markAllAsRead(@Body('nurseId') nurseId: string) {
    return this.notificationsService.markAllAsRead(nurseId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
