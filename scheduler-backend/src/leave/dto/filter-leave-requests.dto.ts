import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { $Enums } from '@prisma/client';

export class FilterLeaveRequestsDto {
  @ApiPropertyOptional({ enum: $Enums.LeaveStatus })
  @IsOptional()
  @IsEnum($Enums.LeaveStatus)
  status?: $Enums.LeaveStatus;
}