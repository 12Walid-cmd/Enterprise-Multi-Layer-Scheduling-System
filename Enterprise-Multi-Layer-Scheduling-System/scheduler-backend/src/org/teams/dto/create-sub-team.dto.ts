import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSubTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timezone?: string;


  @IsOptional()
  @IsUUID()
  lead_user_id?: string;

  @IsOptional()
  @IsUUID()
  parent_team_id?: string;
}