import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGlobalRoleTypeDto } from './dto/create-global-role-type.dto';
import { UpdateGlobalRoleTypeDto } from './dto/update-global-role-type.dto';

@Injectable()
export class GlobalRoleTypesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateGlobalRoleTypeDto) {
        const exists = await this.prisma.global_role_types.findUnique({
            where: { code: dto.code },
        });

        if (exists) {
            throw new BadRequestException("Code already exists");
        }

        return this.prisma.global_role_types.create({ data: dto });
    }


    findAll(search?: string) {
        return this.prisma.global_role_types.findMany({
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

    findOne(id: string) {
        return this.prisma.global_role_types.findUnique({
            where: { id },
        });
    }

    update(id: string, dto: UpdateGlobalRoleTypeDto) {
        return this.prisma.global_role_types.update({
            where: { id },
            data: dto,
        });
    }

    remove(id: string) {
        return this.prisma.global_role_types.delete({ where: { id } });
    }

    async checkCode(code: string, excludeId?: string) {
        const existing = await this.prisma.global_role_types.findFirst({
            where: {
                code,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        });

        return { exists: !!existing };
    }
}