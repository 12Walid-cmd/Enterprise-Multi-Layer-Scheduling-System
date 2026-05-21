import { IsString, IsOptional } from "class-validator";

export class CreateGlobalRoleTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}