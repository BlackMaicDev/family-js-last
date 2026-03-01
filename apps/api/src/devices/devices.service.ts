import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
    constructor(private prisma: PrismaService) { }

    async create(createDeviceDto: CreateDeviceDto, userId: string) {
        return this.prisma.device.create({
            data: {
                ...createDeviceDto,
                userId,
            },
        });
    }

    async findAllByUser(userId: string) {
        return this.prisma.device.findMany({
            where: { userId },
            include: {
                geofences: true,
                _count: { select: { alerts: { where: { isResolved: false } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const device = await this.prisma.device.findUnique({
            where: { id },
            include: {
                geofences: true,
                locations: { orderBy: { timestamp: 'desc' }, take: 1 },
            },
        });

        if (!device) {
            throw new NotFoundException(`Device with ID ${id} not found`);
        }

        return device;
    }

    async findByMacAddress(macAddress: string) {
        const device = await this.prisma.device.findUnique({
            where: { macAddress },
            // ส่งกลับแค่ข้อมูลที่จำเป็นสำหรับบอร์ด
            select: { id: true, name: true, battery: true, isOnline: true }
        });

        if (!device) {
            throw new NotFoundException(`Device with MAC ${macAddress} not found`);
        }

        return device;
    }

    async update(id: string, updateDeviceDto: UpdateDeviceDto, userId: string, userRole: string) {
        const device = await this.findOne(id);

        if (device.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this device');
        }

        return this.prisma.device.update({
            where: { id },
            data: updateDeviceDto,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const device = await this.findOne(id);

        if (device.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this device');
        }

        return this.prisma.device.delete({
            where: { id },
        });
    }
}
