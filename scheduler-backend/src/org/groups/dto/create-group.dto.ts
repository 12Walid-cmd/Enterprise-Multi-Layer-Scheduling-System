import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
} from "class-validator";

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timezone?: string = "UTC";

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  //  NEW: Group Owner
  @IsOptional()
  @IsUUID()
  owner_user_id?: string;
}