import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Injectable()
export class EducationsService {
    constructor(private prisma: PrismaService) { }

    async create(createEducationDto: CreateEducationDto, userId: string) {
        return this.prisma.education.create({
            data: {
                ...createEducationDto,
                startDate: new Date(createEducationDto.startDate),
                endDate: createEducationDto.endDate ? new Date(createEducationDto.endDate) : null,
                userId,
            }
        });
    }

    async findAll() {
        return this.prisma.education.findMany({
            orderBy: { startDate: 'desc' },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.education.findMany({
            where: { userId },
            orderBy: { startDate: 'desc' },
        });
    }

    async findOne(id: string) {
        const education = await this.prisma.education.findUnique({
            where: { id }
        });

        if (!education) {
            throw new NotFoundException(`Education with ID ${id} not found`);
        }

        return education;
    }

    async update(id: string, updateEducationDto: UpdateEducationDto, userId: string, userRole: string) {
        const education = await this.findOne(id);

        if (education.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this education record');
        }

        const dataToUpdate: any = { ...updateEducationDto };
        if (updateEducationDto.startDate) dataToUpdate.startDate = new Date(updateEducationDto.startDate);
        if (updateEducationDto.endDate) dataToUpdate.endDate = new Date(updateEducationDto.endDate);

        return this.prisma.education.update({
            where: { id },
            data: dataToUpdate,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const education = await this.findOne(id);

        if (education.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this education record');
        }

        return this.prisma.education.delete({
            where: { id },
        });
    }
}
