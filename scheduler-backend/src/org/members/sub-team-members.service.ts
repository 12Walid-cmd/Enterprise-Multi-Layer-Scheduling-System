import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddSubTeamMemberDto } from './dto/add-sub-team-members.dto';

@Injectable()
export class SubTeamMembersService {
    constructor(private readonly prisma: PrismaService) { }

    getMembers(subTeamId: string) {
        return this.prisma.sub_team_members.findMany({
            where: { sub_team_id: subTeamId },
            include: {
                users: true,
            },
        });
    }

    addMember(subTeamId: string, dto: AddSubTeamMemberDto) {
        return this.prisma.sub_team_members.create({
            data: {
                sub_team_id: subTeamId,
                user_id: dto.userId,
            },
        });
    }

    removeMember(subTeamId: string, userId: string) {
        return this.prisma.sub_team_members.delete({
            where: {
                sub_team_id_user_id: {
                    sub_team_id: subTeamId,
                    user_id: userId,
                },
            },
        });
    }
}