import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSubTeamDto } from './dto/create-sub-team.dto';
import { UpdateSubTeamDto } from './dto/update-sub-team.dto';
import { AddMemberDto } from '../members/dto/add-member.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';


@Injectable()
export class SubTeamService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditWriter,
    ) { }


    async getParentTeams() {
        return this.prisma.teams.findMany({
            where: {
                parent_team_id: null,
                is_active: true,
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async getSubTeams(search?: string) {
        return this.prisma.teams.findMany({
            where: {
                is_active: true,

                //  subteam
                parent_team_id: {
                    not: null,
                },

                //  search 
                ...(search
                    ? {
                        OR: [
                            // subteam
                            {
                                name: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                description: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                timezone: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },

                            //  parent team name
                            {
                                teams: {
                                    name: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        ],
                    }
                    : {}),
            },

            select: {
                id: true,
                name: true,
                description: true,
                timezone: true,
                parent_team_id: true,
                group_id: true,
                created_at: true,

                // parent team
                teams: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                // lead
                lead: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },

                // members count
                _count: {
                    select: {
                        sub_team_members: true,
                    },
                },
            },

            orderBy: {
                created_at: "desc",
            },
        });
    }

    // create subteam
    async createSubTeam(
        dto: CreateSubTeamDto,
        userId: string,
    ) {
        const parent = await this.prisma.teams.findUnique({
            where: { id: dto.parent_team_id },
        });

        if (!parent) throw new NotFoundException('Parent team not found');

        const subTeam = await this.prisma.teams.create({
            data: {
                name: dto.name,
                description: dto.description,
                timezone: dto.timezone ?? parent.timezone, // timezone
                parent_team_id: dto.parent_team_id,
                group_id: parent.group_id,
                //  lead 
                lead_user_id: dto.lead_user_id ?? null,
            },
        });

        await this.audit.team.created(userId, subTeam.id, subTeam);
        return subTeam;
    }

    async getSubTeam(id: string) {
        const subTeam = await this.prisma.teams.findUnique({
            where: { id },
            include: {
                lead: true,
                _count: {
                    select: { team_members: true },
                },
            },
        });

        if (!subTeam) throw new NotFoundException('Sub-team not found');
        return subTeam;
    }

    async updateSubTeam(id: string, dto: UpdateSubTeamDto, userId: string) {
        const before = await this.prisma.teams.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Sub-team not found');

        const after = await this.prisma.teams.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                timezone: dto.timezone,
                lead_user_id: dto.lead_user_id ?? undefined,
            },
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

    async listRootTeams() {
        return this.prisma.teams.findMany({
            where: { parent_team_id: null, is_active: true },
            select: { id: true, name: true },
        });
    }
}