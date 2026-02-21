import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateEducationDto {
    @IsString()
    @IsNotEmpty()
    schoolName: string;

    @IsString()
    @IsNotEmpty()
    degree: string;

    @IsString()
    @IsOptional()
    field?: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;
}
