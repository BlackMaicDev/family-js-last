import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { AlertType } from '@prisma/client';

@Injectable()
export class LocationsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Sync GPS location from IoT device.
     * Also checks Geofences and creates alerts if device enters/exits.
     */
    async sync(createLocationDto: CreateLocationDto) {
        let deviceId = createLocationDto.deviceId;

        // ถ้าลูกข่ายส่งแค่ macAddress มา ให้ไปหา deviceId ให้อัตโนมัติ
        if (!deviceId && createLocationDto.macAddress) {
            const device = await this.prisma.device.findUnique({
                where: { macAddress: createLocationDto.macAddress }
            });
            if (!device) {
                throw new NotFoundException(`Device with MAC ${createLocationDto.macAddress} not found`);
            }
            deviceId = device.id;
        }

        if (!deviceId) {
            throw new NotFoundException('Either deviceId or macAddress must be provided');
        }

        // 1. Save the location
        const location = await this.prisma.location.create({
            data: {
                lat: createLocationDto.lat,
                lng: createLocationDto.lng,
                speed: createLocationDto.speed,
                deviceId: deviceId,
            },
        });

        // 2. Update device lastSeen & isOnline & battery
        const updateData: any = {
            isOnline: true,
            lastSeen: new Date(),
        };

        if (createLocationDto.battery !== undefined) {
            updateData.battery = createLocationDto.battery;
        }

        await this.prisma.device.update({
            where: { id: deviceId },
            data: updateData,
        });

        // 3. Check Geofences
        await this.checkGeofences(deviceId, createLocationDto.lat, createLocationDto.lng);

        return location;
    }

    /**
     * Get location history for a device.
     */
    async findByDevice(deviceId: string, limit: number = 100) {
        return this.prisma.location.findMany({
            where: { deviceId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    /**
     * Get latest location for all devices of a user.
     */
    async getLatestForUser(userId: string) {
        const devices = await this.prisma.device.findMany({
            where: { userId },
            include: {
                locations: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
                geofences: true,
            },
        });

        return devices.map(device => ({
            deviceId: device.id,
            deviceName: device.name,
            battery: device.battery,
            isOnline: device.isOnline,
            lastSeen: device.lastSeen,
            latestLocation: device.locations[0] || null,
            geofences: device.geofences,
        }));
    }

    /**
     * Calculate distance between two GPS coordinates using Haversine formula.
     * Returns distance in meters.
     */
    private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371e3; // Earth's radius in meters
        const toRad = (deg: number) => (deg * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Check if device entered/exited geofences and create alerts accordingly.
     */
    private async checkGeofences(deviceId: string, lat: number, lng: number) {
        const geofences = await this.prisma.geofence.findMany({
            where: { deviceId },
        });

        // Get the previous location to compare
        const previousLocations = await this.prisma.location.findMany({
            where: { deviceId },
            orderBy: { timestamp: 'desc' },
            take: 2, // current (just saved) + previous
        });

        if (previousLocations.length < 2) return; // Not enough data to compare

        const previousLoc = previousLocations[1]; // second most recent

        for (const geofence of geofences) {
            const currentDistance = this.haversineDistance(lat, lng, geofence.lat, geofence.lng);
            const previousDistance = this.haversineDistance(previousLoc.lat, previousLoc.lng, geofence.lat, geofence.lng);

            const isInsideNow = currentDistance <= geofence.radius;
            const wasInsideBefore = previousDistance <= geofence.radius;

            if (!wasInsideBefore && isInsideNow) {
                // Device ENTERED the geofence
                await this.prisma.alert.create({
                    data: {
                        type: AlertType.GEOFENCE_ENTER,
                        message: `อุปกรณ์เข้าเขตพื้นที่ "${geofence.name}"`,
                        deviceId,
                    },
                });
            } else if (wasInsideBefore && !isInsideNow) {
                // Device EXITED the geofence
                await this.prisma.alert.create({
                    data: {
                        type: AlertType.GEOFENCE_EXIT,
                        message: `อุปกรณ์ออกนอกเขตพื้นที่ "${geofence.name}"`,
                        deviceId,
                    },
                });
            }
        }
    }
}
