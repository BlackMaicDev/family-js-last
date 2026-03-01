import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('devices')
export class DevicesController {
    constructor(private readonly devicesService: DevicesService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createDeviceDto: CreateDeviceDto, @Request() req) {
        return this.devicesService.create(createDeviceDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req) {
        return this.devicesService.findAllByUser(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.devicesService.findOne(id);
    }

    // Endpoint นี้เปิดสาธารณะ (ไม่มี @UseGuards) เพื่อให้ ESP32 ยิงมาขอ ID ตอนเปิดเครื่องได้
    @Get('mac/:macAddress')
    findByMacAddress(@Param('macAddress') macAddress: string) {
        return this.devicesService.findByMacAddress(macAddress);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto, @Request() req) {
        return this.devicesService.update(id, updateDeviceDto, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.devicesService.remove(id, req.user.userId, req.user.role);
    }
}
