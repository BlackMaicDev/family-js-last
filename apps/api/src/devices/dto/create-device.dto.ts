import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateDeviceDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    simNumber?: string;

    @IsString()
    @IsOptional()
    macAddress?: string;

    @IsNumber()
    @IsOptional()
    battery?: number;

    @IsBoolean()
    @IsOptional()
    isOnline?: boolean;

    @IsString()
    @IsNotEmpty()
    userId: string;
}
