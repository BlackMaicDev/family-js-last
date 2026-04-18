import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('book-categories')
export class BookCategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.bookCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
