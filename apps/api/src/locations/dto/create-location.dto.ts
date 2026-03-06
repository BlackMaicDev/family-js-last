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

    @IsNumber()
    @IsOptional()
    battery?: number; // รับค่าแบตเตอรี่

    @IsString()
    @IsOptional()
    macAddress?: string; // เผื่อส่ง macAddress มาแทน

    @IsString()
    @IsOptional()
    deviceId?: string; // เปลี่ยนเป็น Optional เผื่อส่งแค่ macAddress
}
