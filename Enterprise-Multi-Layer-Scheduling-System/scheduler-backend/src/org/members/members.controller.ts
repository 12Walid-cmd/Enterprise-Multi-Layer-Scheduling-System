import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MembersService } from './members.service';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('teams/:teamId/members')
export class MembersController {
  constructor(private readonly service: MembersService) {}

  @Get()
  getMembers(@Param('teamId') teamId: string) {
    return this.service.getMembers(teamId);
  }


  @Post()
  add(@Param('teamId') teamId: string, @Body() dto: AddMemberDto) {
    return this.service.addMember(teamId, dto);
  }

  @Delete(':userId')
  remove(@Param('teamId') teamId: string, @Param('userId') userId: string) {
    return this.service.removeMember(teamId, userId);
  }
}