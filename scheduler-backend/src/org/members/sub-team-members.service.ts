import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddSubTeamMemberDto } from './dto/add-sub-team-members.dto';

@Injectable()
export class SubTeamMembersService {
    constructor(private readonly prisma: PrismaService) { }

    async getMembers(subTeamId: string) {
        
        const subTeam = await this.prisma.teams.findUnique({
            where: { id: subTeamId },
            select: { parent_team_id: true },
        });

        if (!subTeam?.parent_team_id) {
            return [];
        }

        
        const members = await this.prisma.sub_team_members.findMany({
            where: { sub_team_id: subTeamId },
            include: {
                users: true,
            },
        });

        
        const parentMembers = await this.prisma.team_members.findMany({
            where: {
                team_id: subTeam.parent_team_id,
                user_id: { in: members.map(m => m.user_id) },
            },
            include: {
                team_roles: true,
            },
        });

        
        const roleMap = new Map(
            parentMembers.map(m => [m.user_id, m.team_roles])
        );

       
        return members.map(m => ({
            ...m,
            team_roles: roleMap.get(m.user_id) || null,
        }));
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