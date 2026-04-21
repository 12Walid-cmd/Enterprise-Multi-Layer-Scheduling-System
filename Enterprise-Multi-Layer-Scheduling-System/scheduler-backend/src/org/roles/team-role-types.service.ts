import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamRoleTypeDto } from './dto/create-team-role-type.dto';
import { UpdateTeamRoleTypeDto } from './dto/update-team-role-type.dto';

@Injectable()
export class TeamRoleTypesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateTeamRoleTypeDto) {
        const exists = await this.prisma.team_role_types.findUnique({
            where: { code: dto.code },
        });

        if (exists) {
            throw new BadRequestException("Code already exists");
        }
        return this.prisma.team_role_types.create({ data: dto });
    }

    findAll(search?: string) {
        return this.prisma.team_role_types.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { code: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {},
        });
    }

    update(id: string, dto: UpdateTeamRoleTypeDto) {
        return this.prisma.team_role_types.update({
            where: { id },
            data: dto,
        });
    }

    findOne(id: string) {
        return this.prisma.team_role_types.findUnique({
            where: { id },
        });
    }

    remove(id: string) {
        return this.prisma.team_role_types.delete({ where: { id } });
    }

    async checkCode(code: string, excludeId?: string) {
        const existing = await this.prisma.team_role_types.findFirst({
            where: {
                code: {
                    equals: code,
                    mode: "insensitive",
                },
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        });

        return { exists: !!existing };
    }
}