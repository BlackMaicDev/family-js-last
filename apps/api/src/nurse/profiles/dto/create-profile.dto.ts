import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { NursePosition } from '@prisma/client-nurse';

export class CreateProfileDto {
  @IsString()
  employeeId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(NursePosition)
  position?: NursePosition;

  @IsOptional()
  @IsString()
  licenseNo?: string;

  @IsString()
  wardId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  hireDate?: string;
}
