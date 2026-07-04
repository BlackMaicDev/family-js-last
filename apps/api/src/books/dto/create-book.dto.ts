import { IsString, IsArray, IsOptional, IsInt, IsUrl, IsNumber } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  authors: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @IsOptional()
  pageCount?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsString()
  @IsOptional()
  bookCategoryId?: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}
