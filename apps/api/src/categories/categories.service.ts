import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        // Check if name or slug already exists
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { name: createCategoryDto.name },
                    { slug: createCategoryDto.slug }
                ]
            }
        });

        if (existingCategory) {
            throw new ConflictException('Category with this name or slug already exists');
        }

        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }

    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                posts: {
                    select: { id: true, title: true, status: true, createdAt: true }
                }
            }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        // Check existence first
        await this.findOne(id);

        // Check duplication if changing name or slug (should be handled gracefully by prisma but doing it here is cleaner)
        try {
            return await this.prisma.category.update({
                where: { id },
                data: updateCategoryDto,
            });
        } catch (error) {
            // P2002 is Prisma's unique constraint violation code
            if (error.code === 'P2002') {
                throw new ConflictException('Category name or slug already exists');
            }
            throw error;
        }
    }

    async remove(id: string) {
        // Check existence first
        await this.findOne(id);

        return this.prisma.category.delete({
            where: { id },
        });
    }
}
