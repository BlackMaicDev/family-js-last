import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { deleteFileFromUrl } from '../utils/file.util';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async create(createDocumentDto: CreateDocumentDto, userId: string) {
        return this.prisma.document.create({
            data: {
                ...createDocumentDto,
                userId,
            },
            include: {
                user: { select: { id: true, username: true, nickname: true, avatarUrl: true } }
            }
        });
    }

    async findAll() {
        return this.prisma.document.findMany({
            include: {
                user: {
                    select: { id: true, username: true, nickname: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, username: true, nickname: true, avatarUrl: true },
                },
            },
        });

        if (!document) {
            throw new NotFoundException(`Document with ID ${id} not found`);
        }

        return document;
    }

    async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string, userRole: string) {
        const document = await this.findOne(id);

        // อนุญาตให้แก้ไขได้เฉพาะเจ้าของไฟล์ หรือ Admin
        if (document.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to update this document');
        }

        return this.prisma.document.update({
            where: { id },
            data: updateDocumentDto,
        });
    }

    async remove(id: string, userId: string, userRole: string) {
        const document = await this.findOne(id);

        // อนุญาตให้ลบได้เฉพาะเจ้าของไฟล์ หรือ Admin
        if (document.userId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('You are not allowed to delete this document');
        }

        const deletedDocument = await this.prisma.document.delete({
            where: { id },
        });

        if (deletedDocument.filePath) {
            deleteFileFromUrl(deletedDocument.filePath);
        }

        return deletedDocument;
    }
}
