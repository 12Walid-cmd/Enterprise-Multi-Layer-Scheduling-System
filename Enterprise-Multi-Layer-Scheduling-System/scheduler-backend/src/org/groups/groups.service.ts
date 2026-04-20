import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService,
    private audit: AuditWriter,
  ) { }

  async create(data: CreateGroupDto, userId: string) {
    const group = await this.prisma.groups.create({
      data: {
        name: data.name,
        description: data.description,
        timezone: data.timezone ?? "UTC",
        is_active: data.is_active ?? true,
        owner_user_id: data.owner_user_id ?? null,
      },
    });

    await this.audit.group.created(userId, group.id, group);
    return group;
  }


  findAll(search?: string) {
    return this.prisma.groups.findMany({
      where: {
        is_active: true,

        ...(search
          ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { timezone: { contains: search, mode: "insensitive" } },
            ],
          }
          : {}),
      },

      select: {
        id: true,
        name: true,
        description: true,
        timezone: true,
        is_active: true,
        created_at: true,

        _count: {
          select: {
            teams: {
              where: {
                is_active: true,
                parent_team_id: null,
              },
            },
          },
        },

        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },

      orderBy: {
        created_at: "desc",
      },
    });
  }

  findOne(id: string) {
    return this.prisma.groups.findUnique({
      where: { id },

      include: {
        teams: true,
        domains: true,
        holidays: true,

        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateGroupDto, userId: string) {
    const before = await this.prisma.groups.findUnique({ where: { id } });

    const after = await this.prisma.groups.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        timezone: data.timezone,
        is_active: data.is_active,
        owner_user_id: data.owner_user_id,
      },
    });

    await this.audit.group.updated(userId, id, before, after);
    return after;
  }

  async remove(id: string, userId: string) {
    await this.audit.group.deleted(userId, id);
    return this.prisma.groups.update({
      where: { id },
      data: { is_active: false },
    });
  }

}