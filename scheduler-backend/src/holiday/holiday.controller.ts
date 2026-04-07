import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';


@Controller('holidays')
export class HolidayController {
    constructor(private readonly holidayService: HolidayService) { }

    @Post()
    create(@Body() dto: CreateHolidayDto, @CurrentUser('id') userId: string) {
        return this.holidayService.create(dto, userId);
    }

    @Get()
    findAll() {
        return this.holidayService.findAll();
    }

    @Get('group/:groupId')
    findByGroup(@Param('groupId') groupId: string) {
        return this.holidayService.findByGroup(groupId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.holidayService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateHolidayDto, @CurrentUser('id') userId: string) {
        return this.holidayService.update(id, dto, userId);
    }


    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.holidayService.remove(id, userId);
    }

}