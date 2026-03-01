import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertType } from '@prisma/client';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async create(createAlertDto: CreateAlertDto) {
        return this.prisma.alert.create({
            data: {
                type: createAlertDto.type as AlertType,
                message: createAlertDto.message,
                deviceId: createAlertDto.deviceId,
            },
        });
    }

    async findAllByUser(userId: string) {
        return this.prisma.alert.findMany({
            where: {
                device: { userId },
            },
            include: {
                device: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findUnresolved(userId: string) {
        return this.prisma.alert.findMany({
            where: {
                device: { userId },
                isResolved: false,
            },
            include: {
                device: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async resolve(id: string) {
        return this.prisma.alert.update({
            where: { id },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
            },
        });
    }

    async resolveAll(userId: string) {
        return this.prisma.alert.updateMany({
            where: {
                device: { userId },
                isResolved: false,
            },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
            },
        });
    }
}
