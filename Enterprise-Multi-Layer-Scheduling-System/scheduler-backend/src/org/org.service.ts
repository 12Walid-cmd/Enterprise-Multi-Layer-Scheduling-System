import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainsService } from './domains/domains.service';
import { DomainTeamsService } from './domains/domain-teams.service';
import { TeamsService } from './teams/teams.service';
import { GroupsService } from './groups/groups.service';

@Injectable()
export class OrgService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groups: GroupsService,
    private readonly teams: TeamsService,
    private readonly domains: DomainsService,
    private readonly domainTeams: DomainTeamsService,
  ) {}

  // ===== Groups =====
  getGroup(id: string) {
    return this.groups.findOne(id);
  }

  // ===== Teams =====
  getTeam(id: string) {
    return this.teams.findOne(id);
  }

  // ===== Domain =====
  getDomain(id: string) {
    return this.domains.findOne(id);
  }

  // ===== Domain-Team =====
  getDomainTeam(id: string) {
    return this.domainTeams.findOne(id);
  }

  // ===== Domain → Teams =====
  getTeamsByDomain(domainId: string) {
    return this.domainTeams.findTeamsByDomain(domainId);
  }

  // ===== Team → Domains =====
  getDomainsByTeam(teamId: string) {
    return this.domainTeams.findDomainsByTeam(teamId);
  }
}