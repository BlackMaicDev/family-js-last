import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async searchGoogleBooks(query: string) {
    console.log(`Searching Google Books for: ${query}`);
    try {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10${apiKey ? `&key=${apiKey}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Google Books API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      console.log(`Found ${data.items?.length || 0} books`);

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
    } catch (error) {
      console.error('Error searching Google Books:', error);
      return [];
    }
  }

  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: createBookDto,
    });
  }

  async findAll() {
    return this.prisma.book.findMany({
      include: { bookCategory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { bookCategory: true },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async remove(id: string) {
    return this.prisma.book.delete({ where: { id } });
  }
}
