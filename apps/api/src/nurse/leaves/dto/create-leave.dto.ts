import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { LeaveType } from '@prisma/client-nurse';

export class CreateLeaveDto {
  @IsString()
  nurseId: string;

  @IsEnum(LeaveType)
  type: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
