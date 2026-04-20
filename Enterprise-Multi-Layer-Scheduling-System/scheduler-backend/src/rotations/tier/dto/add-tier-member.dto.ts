import { IsEnum, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { RotationMemberType } from '@prisma/client';

export class AddTierMemberDto {
  @IsEnum(RotationMemberType)
  memberType: RotationMemberType;

  @IsUUID()
  memberRefId: string;

  @IsInt()
  @Min(1)
  weight: number;
}