import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { GeofencesService } from './geofences.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('geofences')
export class GeofencesController {
    constructor(private readonly geofencesService: GeofencesService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createGeofenceDto: CreateGeofenceDto, @Request() req) {
        return this.geofencesService.create(createGeofenceDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('device/:deviceId')
    findByDevice(@Param('deviceId') deviceId: string) {
        return this.geofencesService.findByDevice(deviceId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.geofencesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGeofenceDto: UpdateGeofenceDto, @Request() req) {
        return this.geofencesService.update(id, updateGeofenceDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.geofencesService.remove(id, req.user.userId);
    }
}
