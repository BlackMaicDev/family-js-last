import { IsString, IsNumber, IsOptional, IsBoolean, IsHexColor, Matches } from 'class-validator';

export class CreateShiftTypeDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;

  @IsNumber()
  durationHours: number;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
