import { IsString, IsOptional } from 'class-validator';

export class CreateSubTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

}