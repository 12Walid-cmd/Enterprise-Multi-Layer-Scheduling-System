import { IsString } from "class-validator";

export class AssignUserGlobalRoleDto {
  @IsString()
  userId: string;

  @IsString()
  globalRoleId: string;
}