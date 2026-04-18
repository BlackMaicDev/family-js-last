import { IsString, IsArray, IsOptional, IsInt, IsUrl } from 'class-validator';

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
  categoryId?: string;
}
