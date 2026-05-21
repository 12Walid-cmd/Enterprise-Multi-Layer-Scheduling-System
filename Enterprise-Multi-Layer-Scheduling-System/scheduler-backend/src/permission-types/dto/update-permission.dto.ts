import { IsString, Length, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @Length(1, 128)
  code: string;

  @IsString()
  @Length(1, 128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}