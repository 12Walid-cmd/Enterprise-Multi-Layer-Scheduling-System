import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { SubTeamMembersService } from './sub-team-members.service';
import { AddSubTeamMemberDto } from './dto/add-sub-team-members.dto';


@Controller('teams/sub-teams/:subTeamId/members')
export class SubTeamMembersController {
  constructor(private readonly service: SubTeamMembersService) {}

  @Get()
  getMembers(@Param('subTeamId') subTeamId: string) {
    return this.service.getMembers(subTeamId);
  }

  @Post()
  add(@Param('subTeamId') subTeamId: string, @Body() dto: AddSubTeamMemberDto) {
    return this.service.addMember(subTeamId, dto);
  }

  @Delete(':userId')
  remove(@Param('subTeamId') subTeamId: string, @Param('userId') userId: string) {
    return this.service.removeMember(subTeamId, userId);
  }
}