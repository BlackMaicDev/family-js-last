import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
    constructor(private prisma: PrismaService) { }

    async upsert(userId: string, updateProfileDto: UpdateProfileDto) {
        return this.prisma.profile.upsert({
            where: { userId },
            update: updateProfileDto,
            create: {
                ...updateProfileDto,
                userId, // 1:1 กับ User
            },
            include: {
                user: { select: { username: true, nickname: true, email: true } }
            }
        });
    }

    async findOne(userId: string) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { username: true, nickname: true, email: true }
                }
            }
        });

        if (!profile) {
            throw new NotFoundException(`Profile not found for this user`);
        }

        return profile;
    }
}
