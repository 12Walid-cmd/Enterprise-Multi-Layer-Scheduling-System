import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SubTeamService } from './sub-team.service';
import { CreateSubTeamDto } from './dto/create-sub-team.dto';
import { UpdateSubTeamDto } from './dto/update-sub-team.dto';
import { AddMemberDto } from '../members/dto/add-member.dto';

@Controller('teams')
export class SubTeamController {
  constructor(private readonly subTeamService: SubTeamService) {}

  @Get(':teamId/sub-teams')
  getSubTeams(@Param('teamId') teamId: string) {
    return this.subTeamService.getSubTeams(teamId);
  }

  @Post(':teamId/sub-teams')
  createSubTeam(
    @Param('teamId') teamId: string,
    @Body() dto: CreateSubTeamDto,
  ) {
    console.log(CreateSubTeamDto);

    return this.subTeamService.createSubTeam(teamId, dto);
  }

  @Get('sub-teams/:id')
  getSubTeam(@Param('id') id: string) {
    return this.subTeamService.getSubTeam(id);
  }

  @Put('sub-teams/:id')
  updateSubTeam(
    @Param('id') id: string,
    @Body() dto: UpdateSubTeamDto,
  ) {
    return this.subTeamService.updateSubTeam(id, dto);
  }

  @Delete('sub-teams/:id')
  deleteSubTeam(@Param('id') id: string) {
    return this.subTeamService.deleteSubTeam(id);
  }

  @Get('sub-teams/:id/members')
  getMembers(@Param('id') id: string) {
    return this.subTeamService.getMembers(id);
  }

  @Post('sub-teams/:id/members')
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.subTeamService.addMember(id, dto);
  }

  @Delete('sub-teams/:id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.subTeamService.removeMember(id, userId);
  }
}