import { IsString, IsOptional } from "class-validator";

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  parent_team_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}