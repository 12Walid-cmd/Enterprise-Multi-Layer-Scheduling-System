import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSubTeamDto } from './dto/create-sub-team.dto';
import { UpdateSubTeamDto } from './dto/update-sub-team.dto';
import { AddMemberDto } from '../members/dto/add-member.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';


@Injectable()
export class SubTeamService {
    constructor(private readonly prisma: PrismaService,
        private readonly audit: AuditWriter,
    ) { }

    async getSubTeams(teamId: string) {
        return this.prisma.teams.findMany({
            where: { parent_team_id: teamId },
            orderBy: { created_at: 'asc' },
        });
    }

    async createSubTeam(teamId: string, dto: CreateSubTeamDto, userId: string) {
        const parent = await this.prisma.teams.findUnique({ where: { id: teamId } });
        if (!parent) throw new NotFoundException('Parent team not found');

        const subTeam = await this.prisma.teams.create({
            data: {
                name: dto.name,
                description: dto.description,
                timezone: dto.timezone,
                parent_team_id: teamId,
                group_id: parent.group_id,
            },
        });

        await this.audit.team.created(userId, subTeam.id, subTeam);
        return subTeam;
    }


    async getSubTeam(id: string) {
        const subTeam = await this.prisma.teams.findUnique({
            where: { id },
        });

        if (!subTeam) throw new NotFoundException('Sub-team not found');
        return subTeam;
    }

    async updateSubTeam(id: string, dto: UpdateSubTeamDto, userId: string) {
        const before = await this.prisma.teams.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Sub-team not found');

        const after = await this.prisma.teams.update({
            where: { id },
            data: dto,
        });
        await this.audit.team.updated(userId, id, before, after);
        return after;

    }

    async deleteSubTeam(id: string, userId: string) {
        const exists = await this.prisma.teams.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Sub-team not found');
        await this.audit.team.deleted(userId, id);
        return this.prisma.teams.delete({
            where: { id },
        });
    }
}