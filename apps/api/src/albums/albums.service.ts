import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { deleteFileFromUrl } from '../utils/file.util';

@Injectable()
export class AlbumsService {
    constructor(private prisma: PrismaService) { }

    async create(createAlbumDto: CreateAlbumDto, userId: string) {
        return this.prisma.album.create({
            data: {
                ...createAlbumDto,
                userId,
            }
        });
    }

    async findByUser(userId: string) {
        return this.prisma.album.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                photos: true
            }
        });
    }

    async findOne(id: string) {
        const album = await this.prisma.album.findUnique({
            where: { id },
            include: {
                photos: true
            }
        });

        if (!album) {
            throw new NotFoundException(`Album with ID ${id} not found`);
        }

        return album;
    }

    async update(id: string, updateAlbumDto: UpdateAlbumDto, userId: string, userRole: string) {
        const album = await this.findOne(id);

        if (album.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this album');
        }

        return this.prisma.album.update({
            where: { id },
            data: updateAlbumDto,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const album = await this.findOne(id);

        if (album.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this album');
        }

        const deletedAlbum = await this.prisma.album.delete({
            where: { id },
        });

        if (deletedAlbum.coverImage) {
            deleteFileFromUrl(deletedAlbum.coverImage);
        }

        return deletedAlbum;
    }
}
