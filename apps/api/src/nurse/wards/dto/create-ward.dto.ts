import { IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateWardDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
