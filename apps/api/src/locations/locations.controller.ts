import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    /**
     * Endpoint for IoT device to sync GPS data.
     * This does NOT require JWT auth — IoT boards post directly.
     * You may add API-key auth later.
     */
    @Post('sync')
    sync(@Body() createLocationDto: CreateLocationDto) {
        return this.locationsService.sync(createLocationDto);
    }

    /**
     * Get location history for a specific device.
     */
    @UseGuards(JwtAuthGuard)
    @Get('device/:deviceId')
    findByDevice(
        @Param('deviceId') deviceId: string,
        @Query('limit') limit?: string,
    ) {
        return this.locationsService.findByDevice(deviceId, limit ? parseInt(limit) : 100);
    }

    /**
     * Get latest location for all devices belonging to the logged-in user.
     */
    @UseGuards(JwtAuthGuard)
    @Get('latest')
    getLatest(@Request() req) {
        return this.locationsService.getLatestForUser(req.user.userId);
    }
}
