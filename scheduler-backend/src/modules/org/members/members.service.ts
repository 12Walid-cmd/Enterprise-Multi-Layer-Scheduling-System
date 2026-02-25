import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  addMember(teamId: string, data) {
    return this.prisma.team_members.create({
      data: {
        team_id: teamId,
        ...data,
      },
    });
  }

  removeMember(teamId: string, userId: string) {
    return this.prisma.team_members.delete({
      where: {
        user_id_team_id: {
          user_id: userId,
          team_id: teamId,
        },
      },
    });
  }
}