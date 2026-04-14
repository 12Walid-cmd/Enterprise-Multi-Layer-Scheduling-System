import { IsString, IsOptional, IsUUID } from "class-validator";

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  /*  group 下拉 */
  @IsUUID()
  group_id: string;

  /*  sub team */
  @IsOptional()
  @IsUUID()
  parent_team_id?: string;

  /*  Team Lead */
  @IsOptional()
  @IsUUID()
  lead_user_id?: string;
}