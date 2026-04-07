import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { AuditWriter } from 'src/audit/audit-writer.service';

@Injectable()
export class HolidayService {
    constructor(private prisma: PrismaService,
        private audit: AuditWriter,
    ) { }

    async create(dto: CreateHolidayDto, userId: string) {
        const holiday = await this.prisma.holidays.create({
            data: {
                date: new Date(dto.date),
                name: dto.name,
                group_id: dto.group_id,
                team_id: dto.team_id,
                domain_id: dto.domain_id,
                domain_team_id: dto.domain_team_id,
                global_role_id: dto.global_role_id,
                team_role_id: dto.team_role_id,
            },
        });
        await this.audit.holiday.created(userId, holiday.id, holiday);
        return holiday;

    }

    findAll() {
        return this.prisma.holidays.findMany({
            where: { is_active: true },
            orderBy: { date: 'asc' },
        });
    }

    findByGroup(groupId: string) {
        return this.prisma.holidays.findMany({
            where: { group_id: groupId, is_active: true },
            orderBy: { date: 'asc' },
        });
    }

    findOne(id: string) {
        return this.prisma.holidays.findUnique({ where: { id } });
    }

    async update(id: string, dto: UpdateHolidayDto, userId: string) {
        const before = await this.prisma.holidays.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Holiday not found');

        const after = await this.prisma.holidays.update({
            where: { id },
            data: {
                date: dto.date ? new Date(dto.date) : undefined,
                name: dto.name,
                is_active: dto.is_active,
            },
        });
        await this.audit.holiday.updated(userId, id, before, after);
        return after;

    }

    async remove(id: string, userId: string) {
        const before = await this.prisma.holidays.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Holiday not found');

        const after = await this.prisma.holidays.update({
            where: { id },
            data: { is_active: false },
        });

        await this.audit.holiday.deleted(userId, id);

        return after;
    }

}