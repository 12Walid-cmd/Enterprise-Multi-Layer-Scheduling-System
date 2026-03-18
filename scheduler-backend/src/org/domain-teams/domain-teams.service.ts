import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DomainTeamsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get one domain-team mapping
  async findOne(id: string) {
    return this.prisma.domain_teams.findUnique({
      where: { id },
      include: {
        domains: true,
        teams: true,
      },
    });
  }

  // Get all domain-team mappings
  async findAll() {
    return this.prisma.domain_teams.findMany({
      include: {
        domains: true,
        teams: true,
      },
    });
  }

  // Get all teams under a domain
  async findTeamsByDomain(domainId: string) {
    return this.prisma.domain_teams.findMany({
      where: { domain_id: domainId },
      include: { teams: true },
    });
  }

  // Get all domains a team belongs to
  async findDomainsByTeam(teamId: string) {
    return this.prisma.domain_teams.findMany({
      where: { team_id: teamId },
      include: { domains: true },
    });
  }

  // Create mapping
  async create(domainId: string, teamId: string) {
    return this.prisma.domain_teams.create({
      data: {
        domain_id: domainId,
        team_id: teamId,
      },
    });
  }

  // Delete mapping
  async delete(id: string) {
    return this.prisma.domain_teams.delete({
      where: { id },
    });
  }
}