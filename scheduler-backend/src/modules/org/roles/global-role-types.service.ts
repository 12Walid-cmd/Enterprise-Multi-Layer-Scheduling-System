import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateGlobalRoleTypeDto } from './dto/create-global-role-type.dto';
import { UpdateGlobalRoleTypeDto } from './dto/update-global-role-type.dto';

@Injectable()
export class GlobalRoleTypesService {
    constructor(private readonly prisma: PrismaService) { }

    create(dto: CreateGlobalRoleTypeDto) {
        return this.prisma.global_role_types.create({ data: dto });
    }

    findAll() {
        return this.prisma.global_role_types.findMany();
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
}