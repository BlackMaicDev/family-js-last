import { IsString, IsOptional } from 'class-validator';

export class CreateAlbumDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    coverImage?: string;
}
