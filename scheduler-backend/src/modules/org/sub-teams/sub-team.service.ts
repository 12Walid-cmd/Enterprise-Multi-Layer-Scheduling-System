import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSubTeamDto } from './dto/create-sub-team.dto';
import { UpdateSubTeamDto } from './dto/update-sub-team.dto';
import { AddMemberDto } from '../members/dto/add-member.dto';
import { PrismaService } from '../../../prisma/prisma.service';


@Injectable()
export class SubTeamService {
    constructor(private readonly prisma: PrismaService) { }

    async getSubTeams(teamId: string) {
        return this.prisma.teams.findMany({
            where: { parent_team_id: teamId },
            orderBy: { created_at: 'asc' },
        });
    }

    async createSubTeam(teamId: string, dto: CreateSubTeamDto) {
        const parent = await this.prisma.teams.findUnique({
            where: { id: teamId },
        });

        if (!parent) throw new NotFoundException('Parent team not found');

        return this.prisma.teams.create({
            data: {
                name: dto.name,
                description: dto.description,
                timezone: dto.timezone,
                parent_team_id: teamId,
                group_id: parent.group_id,
            },
        });
    }

    async getSubTeam(id: string) {
        const subTeam = await this.prisma.teams.findUnique({
            where: { id },
        });

        if (!subTeam) throw new NotFoundException('Sub-team not found');
        return subTeam;
    }

    async updateSubTeam(id: string, dto: UpdateSubTeamDto) {
        const exists = await this.prisma.teams.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Sub-team not found');

        return this.prisma.teams.update({
            where: { id },
            data: dto,
        });
    }

    async deleteSubTeam(id: string) {
        const exists = await this.prisma.teams.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Sub-team not found');

        return this.prisma.teams.delete({
            where: { id },
        });
    }

    async getMembers(subTeamId: string) {
        return this.prisma.team_members.findMany({
            where: { team_id: subTeamId },
            include: { users: true },
        });
    }

    async addMember(subTeamId: string, dto: AddMemberDto) {
        const subTeam = await this.prisma.teams.findUnique({
            where: { id: subTeamId },
        });

        if (!subTeam) {
            throw new NotFoundException('Sub-team not found');
        }

        if (!subTeam.parent_team_id) {
            throw new BadRequestException('This team has no parent team.');
        }

        const isParentMember = await this.prisma.team_members.findFirst({
            where: {
                team_id: subTeam.parent_team_id,
                user_id: dto.userId,
            },
        });

        if (!isParentMember) {
            throw new BadRequestException('User must join parent team first');
        }

        return this.prisma.team_members.create({
            data: {
                team_id: subTeamId,
                user_id: dto.userId,
            },
        });
    }

    async removeMember(subTeamId: string, userId: string) {
        return this.prisma.team_members.deleteMany({
            where: {
                team_id: subTeamId,
                user_id: userId,
            },
        });
    }
}