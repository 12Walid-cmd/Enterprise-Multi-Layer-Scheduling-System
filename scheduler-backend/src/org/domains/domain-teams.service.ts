import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DomainTeamsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.domain_teams.findMany({
      include: {
        domains: true,
        teams: true,
        domainTeamMembers: {
          include: { user: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.domain_teams.findUnique({
      where: { id },
      include: {
        domains: true,
        teams: true,
        domainTeamMembers: {
          include: { user: true },
        },
      },
    });
  }

  async findTeamsByDomain(domainId: string) {
    return this.prisma.domain_teams.findMany({
      where: { domain_id: domainId },
      include: { teams: true },
    });
  }

  async findDomainsByTeam(teamId: string) {
    return this.prisma.domain_teams.findMany({
      where: { team_id: teamId },
      include: { domains: true },
    });
  }

  async create(domainId: string, teamId: string) {
    return this.prisma.domain_teams.create({
      data: {
        domain_id: domainId,
        team_id: teamId,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.domain_teams.delete({
      where: { id },
    });
  }

  async addUser(domainTeamId: string, userId: string) {
    return this.prisma.domain_team_members.create({
      data: {
        domain_team_id: domainTeamId,
        user_id: userId,
      },
    });
  }

  async removeUser(domainTeamMemberId: string) {
    return this.prisma.domain_team_members.delete({
      where: { id: domainTeamMemberId },
    });
  }

  async getMembers(domainTeamId: string) {
    return this.prisma.domain_team_members.findMany({
      where: { domain_team_id: domainTeamId },
      include: {
        user: true, 
      },
    });
  }

}