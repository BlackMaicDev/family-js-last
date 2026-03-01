import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';

@Injectable()
export class GeofencesService {
    constructor(private prisma: PrismaService) { }

    async create(createGeofenceDto: CreateGeofenceDto, userId: string) {
        // Verify device belongs to user
        const device = await this.prisma.device.findUnique({
            where: { id: createGeofenceDto.deviceId },
        });

        if (!device) {
            throw new NotFoundException(`Device with ID ${createGeofenceDto.deviceId} not found`);
        }

        if (device.userId !== userId) {
            throw new ForbiddenException('You do not own this device');
        }

        return this.prisma.geofence.create({
            data: {
                name: createGeofenceDto.name,
                lat: createGeofenceDto.lat,
                lng: createGeofenceDto.lng,
                radius: createGeofenceDto.radius,
                deviceId: createGeofenceDto.deviceId,
            },
        });
    }

    async findByDevice(deviceId: string) {
        return this.prisma.geofence.findMany({
            where: { deviceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const geofence = await this.prisma.geofence.findUnique({
            where: { id },
        });

        if (!geofence) {
            throw new NotFoundException(`Geofence with ID ${id} not found`);
        }

        return geofence;
    }

    async update(id: string, updateGeofenceDto: UpdateGeofenceDto, userId: string) {
        const geofence = await this.findOne(id);

        // Verify ownership via device
        const device = await this.prisma.device.findUnique({
            where: { id: geofence.deviceId },
        });

        if (!device) {
            throw new NotFoundException(`Device with ID ${geofence.deviceId} not found`);
        }

        if (device.userId !== userId) {
            throw new ForbiddenException('You do not own this geofence');
        }

        return this.prisma.geofence.update({
            where: { id },
            data: updateGeofenceDto,
        });
    }

    async remove(id: string, userId: string) {
        const geofence = await this.findOne(id);

        const device = await this.prisma.device.findUnique({
            where: { id: geofence.deviceId },
        });

        if (!device) {
            throw new NotFoundException(`Device with ID ${geofence.deviceId} not found`);
        }

        if (device.userId !== userId) {
            throw new ForbiddenException('You do not own this geofence');
        }

        return this.prisma.geofence.delete({
            where: { id },
        });
    }
}
