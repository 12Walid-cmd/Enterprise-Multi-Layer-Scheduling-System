import { IsString, Length } from 'class-validator';

export class CreateGlobalRolePermissionDto {
  @IsString()
  @Length(1, 128)
  permission: string;
}