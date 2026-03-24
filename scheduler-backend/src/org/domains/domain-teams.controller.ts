import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { DomainTeamsService } from './domain-teams.service';
import { AddUserToDomainTeamDto } from './dto/add-user-to-domain-team.dto';
import { DomainTeamMemberDto } from './dto/domain-team-member.dto';

@Controller('domain-teams')
export class DomainTeamsController {
  constructor(private readonly domainTeamsService: DomainTeamsService) { }

  @Get()
  findAll() {
    return this.domainTeamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainTeamsService.findOne(id);
  }

  @Get('domain/:domainId/teams')
  findTeamsByDomain(@Param('domainId') domainId: string) {
    return this.domainTeamsService.findTeamsByDomain(domainId);
  }

  @Get('team/:teamId/domains')
  findDomainsByTeam(@Param('teamId') teamId: string) {
    return this.domainTeamsService.findDomainsByTeam(teamId);
  }

  @Post()
  create(@Body() body: { domain_id: string; team_id: string }) {
    return this.domainTeamsService.create(body.domain_id, body.team_id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.domainTeamsService.delete(id);
  }

  @Post(':domainTeamId/members')
  addUser(@Param('domainTeamId') domainTeamId: string, @Body() dto: AddUserToDomainTeamDto) {
    return this.domainTeamsService.addUser(domainTeamId, dto.user_id);
  }

  @Delete('members/:id')
  removeUser(@Param('id') id: string) {
    return this.domainTeamsService.removeUser(id);
  }

  @Get(':domainTeamId/members')
  getMembers(@Param('domainTeamId') domainTeamId: string) {
    return this.domainTeamsService.getMembers(domainTeamId);
  }


}