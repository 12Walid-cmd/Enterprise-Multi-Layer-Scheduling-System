import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService,
    private audit: AuditWriter,
  ) { }

  async create(data, userId: string) {
    const group = await this.prisma.groups.create({ data });
    await this.audit.group.created(userId, group.id, group);
    return group;
  }


  findAll() {
    return this.prisma.groups.findMany({
      where: { is_active: true },
      include: {
        teams: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.groups.findUnique({
      where: { id },
      include: { teams: true },
    });
  }

  async update(id: string, data, userId: string) {
    const before = await this.prisma.groups.findUnique({ where: { id } });
    const after = await this.prisma.groups.update({ where: { id }, data });

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