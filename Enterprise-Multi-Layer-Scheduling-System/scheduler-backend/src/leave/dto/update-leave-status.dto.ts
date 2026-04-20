import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { $Enums } from '@prisma/client';

export class UpdateLeaveStatusDto {
  @ApiProperty({ enum: Object.values($Enums.LeaveStatus) })
  @IsEnum($Enums.LeaveStatus)
  decision: $Enums.LeaveStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}