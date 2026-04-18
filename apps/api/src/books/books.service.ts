import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async searchGoogleBooks(query: string) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&maxResults=10`
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      description: item.volumeInfo.description,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories || [],
    }));
  }

  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: createBookDto,
    });
  }

  async findAll() {
    return this.prisma.book.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async remove(id: string) {
    return this.prisma.book.delete({ where: { id } });
  }
}
