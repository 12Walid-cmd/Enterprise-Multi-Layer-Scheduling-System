import { IsString, IsOptional, IsUUID, IsBoolean } from "class-validator";

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsUUID()
  parent_team_id?: string;

  @IsOptional()
  @IsUUID()
  lead_user_id?: string;
}