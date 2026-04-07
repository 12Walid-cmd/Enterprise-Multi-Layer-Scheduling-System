import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService,
    private audit: AuditWriter,
  ) { }

  async create(data, userId: string) {
    const team = await this.prisma.teams.create({ data });
    await this.audit.team.created(userId, team.id, team);
    return team;
  }


  findAll() {
    return this.prisma.teams.findMany({
      include: {
        team_members: true,
        other_teams: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.teams.findUnique({
      where: { id },
      include: {
        team_members: {
          include: {
            users: true,
            team_roles: true,
          },
        },
      },
    });
  }



  async update(id: string, data, userId: string) {
    const before = await this.prisma.teams.findUnique({ where: { id } });
    const after = await this.prisma.teams.update({ where: { id }, data });

    await this.audit.team.updated(userId, id, before, after);
    return after;
  }

  async remove(id: string, userId: string) {
    await this.audit.team.deleted(userId, id);
    return this.prisma.teams.update({
      where: { id },
      data: { is_active: false },
    });
  }

}