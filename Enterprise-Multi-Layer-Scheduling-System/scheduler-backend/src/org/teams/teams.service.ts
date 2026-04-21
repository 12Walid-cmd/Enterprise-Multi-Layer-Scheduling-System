import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditWriter,
  ) { }

  /* ================= CREATE ================= */
  async create(data: any, userId: string) {
    const team = await this.prisma.teams.create({
      data: {
        name: data.name,
        description: data.description,
        timezone: data.timezone ?? "UTC",
        group_id: data.group_id,
        parent_team_id: data.parent_team_id ?? null,
        lead_user_id: data.lead_user_id ?? null,
        is_active: true,
      },
    });

    await this.audit.team.created(userId, team.id, team);
    return team;
  }

  /* ================= RECURSIVE COUNT ================= */
  async getTeamMemberCountRecursive(teamId: string): Promise<number> {

    const current = await this.prisma.team_members.count({
      where: { team_id: teamId },
    });


    const subs = await this.prisma.teams.findMany({
      where: { parent_team_id: teamId },
      select: { id: true },
    });

    let subTotal = 0;

    for (const sub of subs) {
      subTotal += await this.getTeamMemberCountRecursive(sub.id);
    }

    return current + subTotal;
  }

  /* ================= FIND ALL ================= */
  async findAll(search?: string) {
    const teams = await this.prisma.teams.findMany({
      where: {
        is_active: true,
        parent_team_id: null,
        ...(search
          ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { timezone: { contains: search, mode: 'insensitive' } },
            ],
          }
          : {}),
      },

      select: {
        id: true,
        name: true,
        description: true,
        timezone: true,
        parent_team_id: true,
        group_id: true,
        lead_user_id: true,
        created_at: true,

        groups: {
          select: {
            id: true,
            name: true,
          },
        },

        lead: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },

        _count: {
          select: {
            team_members: true,
            other_teams: true, //  sub teams
          },
        },
      },

      orderBy: {
        created_at: 'desc',
      },
    });


    const result = await Promise.all(
      teams.map(async (t) => ({
        ...t,
        total_members: await this.getTeamMemberCountRecursive(t.id),
      }))
    );

    return result;
  }

  /* ================= FIND ONE ================= */
  async findOne(id: string) {
    const team = await this.prisma.teams.findUnique({
      where: { id },

      include: {
        //  team members
        team_members: {
          include: {
            users: true,
            team_roles: true,
          },
        },

        //  group 
        groups: {
          select: {
            id: true,
            name: true,
          },
        },

        //  team lead
        lead: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },

        //  sub teams（self relation）
        other_teams: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!team) return null;

    const totalMembers = await this.getTeamMemberCountRecursive(id);

    return {
      ...team,
      total_members: totalMembers,
    };
  }

  /* ================= UPDATE ================= */
  async update(id: string, data: any, userId: string) {
    const before = await this.prisma.teams.findUnique({
      where: { id },
    });

    const updated = await this.prisma.teams.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        timezone: data.timezone,
        group_id: data.group_id,
        parent_team_id: data.parent_team_id ?? null,
        lead_user_id: data.lead_user_id ?? null,
      },
    });

    await this.audit.team.updated(userId, id, before, updated);

    return updated;
  }

  /* ================= DELETE ================= */
  async remove(id: string, userId: string) {
    await this.audit.team.deleted(userId, id);

    return this.prisma.teams.update({
      where: { id },
      data: { is_active: false },
    });
  }
}