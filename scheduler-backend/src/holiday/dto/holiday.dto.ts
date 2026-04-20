import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHolidayDto {
  @IsDateString()
  date: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsUUID()
  team_id?: string;

  @IsOptional()
  @IsUUID()
  domain_id?: string;

  @IsOptional()
  @IsUUID()
  domain_team_id?: string;

  @IsOptional()
  @IsUUID()
  global_role_id?: string;

  @IsOptional()
  @IsUUID()
  team_role_id?: string;
}

export class UpdateHolidayDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  is_active?: boolean;
}