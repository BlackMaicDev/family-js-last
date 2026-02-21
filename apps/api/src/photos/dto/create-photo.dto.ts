import { IsString, IsOptional } from 'class-validator';

export class CreatePhotoDto {
    @IsString()
    url: string;

    @IsString()
    @IsOptional()
    caption?: string;

    @IsString()
    @IsOptional()
    albumId?: string;
}
