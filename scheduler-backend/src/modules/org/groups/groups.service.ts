import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  create(data) {
    return this.prisma.groups.create({ data });
  }

  findAll() {
    return this.prisma.groups.findMany({
      include: {
        teams: true,
      },
    });
  }

  update(id: string, data) {
    return this.prisma.groups.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.groups.update({
      where: { id },
      data: { is_active: false },
    });
  }
}