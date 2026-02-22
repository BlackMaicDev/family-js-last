import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) { }

  async create(createExperienceDto: CreateExperienceDto, userId: string) {
    return this.prisma.experience.create({
      data: {
        ...createExperienceDto,
        startDate: new Date(createExperienceDto.startDate),
        endDate: createExperienceDto.endDate ? new Date(createExperienceDto.endDate) : null,
        userId,
      }
    });
  }

  async findAll() {
    return this.prisma.experience.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.experience.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id }
    });

    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    return experience;
  }

  async update(id: string, updateExperienceDto: UpdateExperienceDto, userId: string, userRole: string) {
    const experience = await this.findOne(id);

    if (experience.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to update this experience record');
    }

    const dataToUpdate: any = { ...updateExperienceDto };
    if (updateExperienceDto.startDate) dataToUpdate.startDate = new Date(updateExperienceDto.startDate);
    if (updateExperienceDto.endDate) dataToUpdate.endDate = new Date(updateExperienceDto.endDate);
    if (updateExperienceDto.endDate === null) dataToUpdate.endDate = null;

    return this.prisma.experience.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const experience = await this.findOne(id);

    if (experience.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to delete this experience record');
    }

    return this.prisma.experience.delete({
      where: { id },
    });
  }
}
