import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreateLeaveRequestDto {
  @ApiProperty({ enum: $Enums.LeaveType })
  @IsEnum($Enums.LeaveType)
  type: $Enums.LeaveType;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  end_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_full_day?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  affects_schedule?: boolean;
}