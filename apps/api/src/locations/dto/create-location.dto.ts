import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;

    @IsNumber()
    @IsOptional()
    speed?: number;

    @IsString()
    @IsNotEmpty()
    deviceId: string;
}
