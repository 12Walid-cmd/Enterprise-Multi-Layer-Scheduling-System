import { IsEnum, IsObject } from 'class-validator';
import { RotationRuleType } from '@prisma/client';

export class CreateRotationRuleDto {
  @IsEnum(RotationRuleType)
  ruleType: RotationRuleType;

  @IsObject()
  rulePayload: Record<string, any> = {};

}