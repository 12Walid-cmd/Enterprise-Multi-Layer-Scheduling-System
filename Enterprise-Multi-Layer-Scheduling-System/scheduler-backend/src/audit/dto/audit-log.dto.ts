import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAuditLogDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsString()
  action: string;

  @IsString()
  entity_type: string;

  @IsUUID()
  entity_id: string;

  @IsOptional()
  details?: any;
}