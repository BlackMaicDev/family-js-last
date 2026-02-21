import { IsString, IsOptional } from 'class-validator';

export class CreateProfileDto {
    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;
}
