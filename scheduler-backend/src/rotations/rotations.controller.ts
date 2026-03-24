import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { RotationsService } from './rotations.service';
import { CreateRotationDto } from './dto/create-rotation.dto';
import { UpdateRotationDto } from './dto/update-rotation.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ReorderMembersDto } from './dto/reorder-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ScheduleService } from '../schedule/schedule.service';

@Controller('rotations')
export class RotationsController {
  constructor(private readonly service: RotationsService, private readonly scheduleService: ScheduleService,) { }

  // ============================
  // Rotation Definitions
  // ============================

  @Post()
  create(@Body() dto: CreateRotationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRotationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ============================
  // Rotation Members
  // ============================

  @Get(':id/members')
  findMembers(@Param('id') id: string) {
    return this.service.findMembers(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.service.addMember(id, dto);
  }

  @Patch(':id/members/reorder')
  reorderMembers(
    @Param('id') id: string,
    @Body() dto: ReorderMembersDto,
  ) {
    return this.service.reorderMembers(id, dto);
  }

  @Delete('members/:memberId')
  removeMember(@Param('memberId') memberId: string) {
    return this.service.removeMember(memberId);
  }

  @Patch('members/:memberId')
  updateMember(
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.service.updateMember(memberId, dto);
  }

// ============================
// Schedule Generation
// ============================

  @Post(':id/schedule/generate')
  async generateSchedule(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id ?? null;
    return this.scheduleService.generateForRotation(id, userId);
  }

  @Get(':id/schedule')
  async getSchedule(@Param('id') id: string) {
    return this.service.getSchedule(id);
  }
}