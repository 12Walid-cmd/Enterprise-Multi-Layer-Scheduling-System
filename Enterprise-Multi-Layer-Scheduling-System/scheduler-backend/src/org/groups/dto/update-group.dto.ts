import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
} from "class-validator";

export class UpdateGroupDto {
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

  //  NEW
  @IsOptional()
  @IsUUID()
  owner_user_id?: string;
}