import { IsString, IsOptional } from "class-validator";

export class UpdateTeamRoleTypeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}