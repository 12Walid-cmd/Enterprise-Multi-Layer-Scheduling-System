import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AddScopeDto {
  @IsString()
  @Type(() => String)
  resourceId: string;
}