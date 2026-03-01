import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGeofenceDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;

    @IsNumber()
    @IsNotEmpty()
    radius: number; // รัศมีในหน่วยเมตร

    @IsString()
    @IsNotEmpty()
    deviceId: string;
}
