import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import * as cheerio from 'cheerio';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async scrapeBook(url: string) {
    console.log(`Scraping book from: ${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const html = await response.text();
      const $ = cheerio.load(html);
      
      let title = '';
      let author = '';
      let publisher = '';
      let price: number | undefined;
      let isbn = '';
      let thumbnail = '';
      let description = '';
      
      if (url.includes('se-ed.com')) {
        title = $('h1').first().text().trim();
        thumbnail = $('img#imgProduct').attr('src') || $('meta[property="og:image"]').attr('content') || '';
        description = $('meta[property="og:description"]').attr('content') || '';
        
        $('table tr').each((_, el) => {
           const text = $(el).text();
           if (text.includes('ผู้เขียน') || text.includes('ผู้แปล')) {
              const val = $(el).find('td').last().text().trim();
              author = author ? author + ', ' + val : val;
           }
           if (text.includes('สำนักพิมพ์')) publisher = $(el).find('td').last().text().trim();
           if (text.includes('บาร์โค้ด') || text.includes('ISBN')) isbn = $(el).find('td').last().text().trim();
        });
        
        const priceText = $('.price-now').first().text().replace(/[^0-9.]/g, '');
        if (priceText) price = parseFloat(priceText);
      } else if (url.includes('naiin.com')) {
        title = $('h1').first().text().trim();
        thumbnail = $('meta[property="og:image"]').attr('content') || '';
        description = $('meta[property="og:description"]').attr('content') || '';
        
        $('.product-detail-list li').each((_, el) => {
           const label = $(el).find('.title').text().trim();
           const value = $(el).find('.data').text().trim();
           if (label.includes('ผู้เขียน') || label.includes('ผู้แปล')) {
              author = author ? author + ', ' + value : value;
           }
           if (label.includes('สำนักพิมพ์')) publisher = value;
           if (label.includes('บาร์โค้ด') || label.includes('ISBN')) isbn = value;
        });
        
        const priceText = $('.txt-price').first().text().replace(/[^0-9.]/g, '');
        if (priceText) price = parseFloat(priceText);
      } else {
        title = $('meta[property="og:title"]').attr('content') || $('title').text();
        thumbnail = $('meta[property="og:image"]').attr('content') || '';
        description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      }
      
      return {
        title: title || '',
        authors: author ? author.split(',').map(a => a.trim()) : [],
        publisher: publisher || '',
        price: price || null,
        isbn: isbn || '',
        thumbnail: thumbnail || '',
        description: description || ''
      };
    } catch (e) {
      console.error('Scrape error:', e);
      return null;
    }
  }

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
