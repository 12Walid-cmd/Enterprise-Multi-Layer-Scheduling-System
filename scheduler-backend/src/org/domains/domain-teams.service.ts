import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';

@Injectable()
export class DomainTeamsService {
  constructor(private readonly prisma: PrismaService,
    private readonly audit: AuditWriter,
  ) { }

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

  async create(domainId: string, teamId: string, userId: string) {
    const domainTeam = await this.prisma.domain_teams.create({
      data: { domain_id: domainId, team_id: teamId },
    });

    await this.audit.domainTeam.created(userId, domainTeam.id, domainTeam);
    return domainTeam;
  }

  async delete(id: string, userId: string) {
    await this.audit.domainTeam.deleted(id, userId);
    return this.prisma.domain_teams.delete({ where: { id } });
  }


  async addUser(domainTeamId: string, targetUserId: string, actingUserId: string) {
    const member = await this.prisma.domain_team_members.create({
      data: {
        domain_team_id: domainTeamId,
        user_id: targetUserId,
      },
    });

    await this.audit.domainTeam.memberAdded(actingUserId, domainTeamId, {
      added_user_id: targetUserId,
    });

    return member;
  }

  async removeUser(domainTeamMemberId: string, actingUserId: string) {
    const before = await this.prisma.domain_team_members.findUnique({
      where: { id: domainTeamMemberId },
    });

    if (!before) throw new NotFoundException('Domain team member not found');

    await this.audit.domainTeam.memberRemoved(actingUserId, before.domain_team_id, {
      removed_user_id: before.user_id,
    });

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