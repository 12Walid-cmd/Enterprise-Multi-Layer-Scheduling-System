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