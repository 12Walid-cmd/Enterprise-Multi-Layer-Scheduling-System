import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  addMember(teamId: string, dto: AddMemberDto) {
    return this.prisma.team_members.create({
      data: {
        team_id: teamId,
        user_id: dto.userId,
        team_role_id: dto.teamRoleId,
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