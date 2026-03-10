import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  create(data) {
    return this.prisma.teams.create({ data });
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



  update(id: string, data) {
    return this.prisma.teams.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.teams.update({
      where: { id },
      data: { is_active: false },
    });
  }
}