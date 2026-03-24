import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}