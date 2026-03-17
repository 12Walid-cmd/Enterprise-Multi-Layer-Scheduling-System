import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamRoleTypeDto } from './dto/create-team-role-type.dto';
import { UpdateTeamRoleTypeDto } from './dto/update-team-role-type.dto';

@Injectable()
export class TeamRoleTypesService {
    constructor(private readonly prisma: PrismaService) { }

    create(dto: CreateTeamRoleTypeDto) {
        return this.prisma.team_role_types.create({ data: dto });
    }

    findAll() {
        return this.prisma.team_role_types.findMany();
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
}