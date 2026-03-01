import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    /**
     * Endpoint for IoT device to trigger SOS or other alerts.
     * Open endpoint (no JWT) — IoT boards post directly.
     */
    @Post()
    create(@Body() createAlertDto: CreateAlertDto) {
        return this.alertsService.create(createAlertDto);
    }

    /**
     * Get all alerts for the logged-in user.
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req) {
        return this.alertsService.findAllByUser(req.user.userId);
    }

    /**
     * Get unresolved alerts only.
     */
    @UseGuards(JwtAuthGuard)
    @Get('unresolved')
    findUnresolved(@Request() req) {
        return this.alertsService.findUnresolved(req.user.userId);
    }

    /**
     * Mark a single alert as resolved.
     */
    @UseGuards(JwtAuthGuard)
    @Patch(':id/resolve')
    resolve(@Param('id') id: string) {
        return this.alertsService.resolve(id);
    }

    /**
     * Mark all alerts as resolved.
     */
    @UseGuards(JwtAuthGuard)
    @Patch('resolve-all')
    resolveAll(@Request() req) {
        return this.alertsService.resolveAll(req.user.userId);
    }
}
