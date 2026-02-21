import { IsString, IsOptional, IsEnum, IsInt, IsUUID, IsNotEmpty } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    thumbnail?: string;

    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus;

    @IsInt()
    @IsOptional()
    rating?: number;

    @IsString()
    @IsOptional()
    bookAuthor?: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;
}
