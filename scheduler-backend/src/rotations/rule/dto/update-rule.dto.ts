import { IsOptional, IsObject } from 'class-validator';

export class UpdateRotationRuleDto {
  @IsOptional()
  @IsObject()
  rulePayload?: Record<string, any> = {};
}