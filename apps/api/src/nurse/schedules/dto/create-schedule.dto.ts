import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftEntryType } from '@prisma/client-nurse';

export class ScheduleEntryDto {
  @IsString()
  nurseId: string;

  @IsDateString()
  date: string;

  @IsEnum(ShiftEntryType)
  type: ShiftEntryType;

  @IsOptional()
  @IsString()
  shiftTypeId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateBulkScheduleDto {
  @IsString()
  wardId: string;

  @IsNumber()
  year: number;

  @IsNumber()
  month: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleEntryDto)
  entries: ScheduleEntryDto[];
}
