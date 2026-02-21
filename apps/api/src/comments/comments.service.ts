import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    async create(createCommentDto: CreateCommentDto, userId: string) {
        // Check if post exists
        const post = await this.prisma.post.findUnique({
            where: { id: createCommentDto.postId }
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check if parent comment exists, if parentId is provided
        if (createCommentDto.parentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: createCommentDto.parentId }
            });

            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        return this.prisma.comment.create({
            data: {
                content: createCommentDto.content,
                postId: createCommentDto.postId,
                parentId: createCommentDto.parentId,
                userId: userId,
            },
            include: {
                user: {
                    select: { id: true, username: true, nickname: true, avatarUrl: true }
                }
            }
        });
    }

    // ดึงคอมเมนต์ทั้งหมดของโพสต์หนึ่งๆ โดยดึงเฉพาะคอมเมนต์หลัก (ที่ไม่มี parentId) แล้ว Include Replies ไปด้วย
    async findByPost(postId: string) {
        return this.prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: null // ดึงแค่คอมเมนต์หลัก
            },
            include: {
                user: {
                    select: { id: true, username: true, nickname: true, avatarUrl: true }
                },
                replies: {
                    include: {
                        user: {
                            select: { id: true, username: true, nickname: true, avatarUrl: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' } // เรียง reply ตามเวลาเก่าไปใหม่
                }
            },
            orderBy: { createdAt: 'desc' } // เรียงคอมเมนต์หลักตามเวลาใหม่ไปเก่า
        });
    }

    async findOne(id: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true, nickname: true, avatarUrl: true } }
            }
        });

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${id} not found`);
        }

        return comment;
    }

    async update(id: string, updateCommentDto: UpdateCommentDto, userId: string, userRole: string) {
        const comment = await this.findOne(id);

        // ตรวจสอบสิทธิ์: ให้เฉพาะเจ้าของคอมเมนต์แก้ไขได้ (Admin ก็แก้ข้อความคนอื่นไม่ได้)
        if (comment.userId !== userId) {
            throw new ForbiddenException('You are not allowed to update this comment');
        }

        return this.prisma.comment.update({
            where: { id },
            // ดึงแค่ content มาอัปเดต เพราะไม่ควรยอมให้อัปเดต postId หรือ parentId หลังจากสร้างไปแล้ว
            data: { content: updateCommentDto.content },
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const comment = await this.findOne(id);

        // ตรวจสอบสิทธิ์: ให้เฉพาะเจ้าของคอมเมนต์ลบได้ หรือ Admin ก็ลบได้เพื่อจัดการความเรียบร้อย
        if (comment.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this comment');
        }

        // ด้วย onDelete: Cascade การลบคอมเมนต์หลัก จะทำให้ replies หายไปด้วย
        return this.prisma.comment.delete({
            where: { id },
        });
    }
}
