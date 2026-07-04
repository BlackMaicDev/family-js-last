import { IsString, IsOptional } from 'class-validator';

export class UpdateColleagueDto {
  @IsOptional()
  @IsString()
  nickname?: string;
}
