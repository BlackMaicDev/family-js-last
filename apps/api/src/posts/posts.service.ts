import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { deleteFileFromUrl } from '../utils/file.util';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }

    async create(createPostDto: CreatePostDto, authorId: string) {
        return this.prisma.post.create({
            data: {
                ...createPostDto,
                authorId,
            },
        });
    }

    async findAll() {
        return this.prisma.post.findMany({
            include: {
                author: {
                    select: { id: true, username: true, nickname: true, avatarUrl: true },
                },
                category: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, username: true, nickname: true, avatarUrl: true },
                },
                category: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, username: true, nickname: true, avatarUrl: true }
                        }
                    }
                }
            },
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        return post;
    }

    async update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string) {
        const post = await this.findOne(id);

        // ตรวจสอบสิทธิ์: ให้เฉพาะเจ้าของโพสต์หรือแอดมินแก้ไขได้
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this post');
        }

        return this.prisma.post.update({
            where: { id },
            data: updatePostDto,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const post = await this.findOne(id);

        // ตรวจสอบสิทธิ์: ให้เฉพาะเจ้าของโพสต์หรือแอดมินลบได้
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this post');
        }

        const deletedPost = await this.prisma.post.delete({
            where: { id },
        });

        if (deletedPost.thumbnail) {
            deleteFileFromUrl(deletedPost.thumbnail);
        }

        return deletedPost;
    }
}
