import { Controller, Get, Param, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { GetScheduleQueryDto } from './dto/get-schedule-query.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';

@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @Get(':rotationId')
    async getSchedule(
        @Param('rotationId') rotationId: string,
        @Query() query: GetScheduleQueryDto,
    ): Promise<ScheduleResponseDto> {
        const from = query.from ? new Date(query.from) : new Date();
        const to = query.to
            ? new Date(query.to)
            : new Date(Date.now() + 30 * 86400000);

        return this.scheduleService.generate(rotationId, from, to);
    }
}