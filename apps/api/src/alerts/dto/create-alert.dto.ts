import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum AlertTypeDto {
    SOS = 'SOS',
    LOW_BATTERY = 'LOW_BATTERY',
    MOTION_DETECTED = 'MOTION_DETECTED',
    GEOFENCE_ENTER = 'GEOFENCE_ENTER',
    GEOFENCE_EXIT = 'GEOFENCE_EXIT',
}

export class CreateAlertDto {
    @IsEnum(AlertTypeDto)
    @IsNotEmpty()
    type: AlertTypeDto;

    @IsString()
    @IsOptional()
    message?: string;

    @IsBoolean()
    @IsOptional()
    isResolved?: boolean;

    @IsString()
    @IsNotEmpty()
    deviceId: string;
}
