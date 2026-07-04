import { IsString, IsOptional } from 'class-validator';

export class CreateColleagueDto {
  @IsString()
  followerId: string;

  @IsString()
  followingId: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}
