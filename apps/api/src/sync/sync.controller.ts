import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncPushDto } from './dto/sync-push.dto';
import { CrocJwtAuthGuard } from '../croc-auth/guards/croc-jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('sync')
@UseGuards(CrocJwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async pullChanges(
    @GetUser('userId') userId: string, // Extracts the correct property from req.user
    @Query('lastSyncTime') lastSyncTime?: string,
  ) {
    return this.syncService.getChangesSince(userId, lastSyncTime);
  }

  @Post()
  async pushChanges(
    @GetUser('userId') userId: string,
    @Body() syncPushDto: SyncPushDto,
  ) {
    return this.syncService.saveChanges(userId, syncPushDto);
  }
}
