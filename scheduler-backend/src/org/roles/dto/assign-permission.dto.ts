import { IsString, IsOptional } from "class-validator";

export class AssignPermissionDto {
  @IsString()
  permission: string;
}