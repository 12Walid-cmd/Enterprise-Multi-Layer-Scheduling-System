import { IsString, IsOptional } from "class-validator";

export class CreateTeamRoleTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}