import { Module } from '@nestjs/common';
import { BookCategoriesController } from './book-categories.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BookCategoriesController],
  providers: [PrismaService],
})
export class BookCategoriesModule {}
