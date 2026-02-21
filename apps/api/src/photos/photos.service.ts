import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { deleteFileFromUrl } from '../utils/file.util';

@Injectable()
export class PhotosService {
    constructor(private prisma: PrismaService) { }

    async create(createPhotoDto: CreatePhotoDto, userId: string) {
        return this.prisma.photo.create({
            data: {
                ...createPhotoDto,
                userId,
            }
        });
    }

    async findAllAdmin() {
        return this.prisma.photo.findMany({
            include: {
                user: { select: { id: true, nickname: true, username: true, avatarUrl: true } },
                album: { select: { id: true, title: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByAlbum(albumId: string) {
        return this.prisma.photo.findMany({
            where: { albumId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.photo.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const photo = await this.prisma.photo.findUnique({
            where: { id }
        });

        if (!photo) {
            throw new NotFoundException(`Photo with ID ${id} not found`);
        }

        return photo;
    }

    async update(id: string, updatePhotoDto: UpdatePhotoDto, userId: string, userRole: string) {
        const photo = await this.findOne(id);

        if (photo.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this photo');
        }

        return this.prisma.photo.update({
            where: { id },
            data: updatePhotoDto,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const photo = await this.findOne(id);

        if (photo.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this photo');
        }

        const deletedPhoto = await this.prisma.photo.delete({
            where: { id },
        });

        deleteFileFromUrl(deletedPhoto.url);

        return deletedPhoto;
    }
}
