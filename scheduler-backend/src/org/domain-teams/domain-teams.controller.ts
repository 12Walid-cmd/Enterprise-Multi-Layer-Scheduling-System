import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { DomainTeamsService } from './domain-teams.service';

@Controller('domain-teams')
export class DomainTeamsController {
  constructor(private readonly domainTeamsService: DomainTeamsService) {}

  // Get all domain-team mappings
  @Get()
  async findAll() {
    return this.domainTeamsService.findAll();
  }

  // Get one domain-team mapping by id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.domainTeamsService.findOne(id);
  }

  // Get all teams under a domain
  @Get('domain/:domainId/teams')
  async findTeamsByDomain(@Param('domainId') domainId: string) {
    return this.domainTeamsService.findTeamsByDomain(domainId);
  }

  // Get all domains a team belongs to
  @Get('team/:teamId/domains')
  async findDomainsByTeam(@Param('teamId') teamId: string) {
    return this.domainTeamsService.findDomainsByTeam(teamId);
  }

  // Create a domain-team mapping
  @Post()
  async create(
    @Body()
    body: {
      domain_id: string;
      team_id: string;
    },
  ) {
    return this.domainTeamsService.create(body.domain_id, body.team_id);
  }

  // Delete a domain-team mapping
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.domainTeamsService.delete(id);
  }
}