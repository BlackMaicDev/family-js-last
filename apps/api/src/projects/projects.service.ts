import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { deleteFileFromUrl } from '../utils/file.util';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(createProjectDto: CreateProjectDto, userId: string) {
        return this.prisma.project.create({
            data: {
                ...createProjectDto,
                userId,
            }
        });
    }

    async findByUser(userId: string) {
        return this.prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return project;
    }

    async update(id: string, updateProjectDto: UpdateProjectDto, userId: string, userRole: string) {
        const project = await this.findOne(id);

        if (project.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this project record');
        }

        return this.prisma.project.update({
            where: { id },
            data: updateProjectDto,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const project = await this.findOne(id);

        if (project.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this project record');
        }

        const deletedProject = await this.prisma.project.delete({
            where: { id },
        });

        if (deletedProject.imageUrl) {
            deleteFileFromUrl(deletedProject.imageUrl);
        }

        return deletedProject;
    }
}
