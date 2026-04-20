import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { Scope } from 'src/permissions/decorators/scope.decorator';

@Controller('holidays')
export class HolidayController {
    constructor(private readonly holidayService: HolidayService) {}

    // -----------------------------
    // Create Holiday (group-level)
    // -----------------------------
    @Permissions('holiday.create')
    @Scope('group', 'groupId')
    @Post('group/:groupId')
    create(
        @Param('groupId') groupId: string,
        @Body() dto: CreateHolidayDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.holidayService.create(groupId, dto, userId);
    }

    // -----------------------------
    // List all holidays (global view)
    // -----------------------------
    @Permissions('holiday.view')
    @Get()
    findAll() {
        return this.holidayService.findAll();
    }

    // -----------------------------
    // List holidays by group
    // -----------------------------
    @Permissions('holiday.view')
    @Scope('group', 'groupId')
    @Get('group/:groupId')
    findByGroup(@Param('groupId') groupId: string) {
        return this.holidayService.findByGroup(groupId);
    }

    // -----------------------------
    // Get holiday by ID
    // -----------------------------
    @Permissions('holiday.view')
    @Scope('group', 'groupId')
    @Get(':id/group/:groupId')
    findOne(
        @Param('id') id: string,
        @Param('groupId') groupId: string,
    ) {
        return this.holidayService.findOne(id);
    }

    // -----------------------------
    // Update holiday
    // -----------------------------
    @Permissions('holiday.update')
    @Scope('group', 'groupId')
    @Patch(':id/group/:groupId')
    update(
        @Param('id') id: string,
        @Param('groupId') groupId: string,
        @Body() dto: UpdateHolidayDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.holidayService.update(id, groupId, dto, userId);
    }

    // -----------------------------
    // Delete holiday
    // -----------------------------
    @Permissions('holiday.delete')
    @Scope('group', 'groupId')
    @Delete(':id/group/:groupId')
    remove(
        @Param('id') id: string,
        @Param('groupId') groupId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.holidayService.remove(id, groupId, userId);
    }
}
