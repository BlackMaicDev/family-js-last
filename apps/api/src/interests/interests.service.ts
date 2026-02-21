import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';

@Injectable()
export class InterestsService {
    constructor(private prisma: PrismaService) { }

    async create(createInterestDto: CreateInterestDto, userId: string) {
        return this.prisma.interest.create({
            data: {
                ...createInterestDto,
                userId,
            }
        });
    }

    async findByUser(userId: string) {
        return this.prisma.interest.findMany({
            where: { userId },
        });
    }

    async findOne(id: string) {
        const interest = await this.prisma.interest.findUnique({
            where: { id }
        });

        if (!interest) {
            throw new NotFoundException(`Interest with ID ${id} not found`);
        }

        return interest;
    }

    async update(id: string, updateInterestDto: UpdateInterestDto, userId: string, userRole: string) {
        const interest = await this.findOne(id);

        if (interest.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this interest');
        }

        return this.prisma.interest.update({
            where: { id },
            data: updateInterestDto,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const interest = await this.findOne(id);

        if (interest.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this interest');
        }

        return this.prisma.interest.delete({
            where: { id },
        });
    }
}
