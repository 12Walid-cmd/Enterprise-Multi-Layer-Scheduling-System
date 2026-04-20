import { IsEnum, IsString } from "class-validator";
import { RotationMemberType } from "@prisma/client";

export class AddMemberDto {
  @IsEnum(RotationMemberType)
  member_type: RotationMemberType;

  @IsString()
  member_ref_id: string;
}