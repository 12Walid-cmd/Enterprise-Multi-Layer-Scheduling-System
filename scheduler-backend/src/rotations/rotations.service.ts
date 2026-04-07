import { Injectable, NotFoundException, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    RotationType,
    RotationCadence,
    RotationScope,
    RotationMemberType,
} from '@prisma/client';

import { CreateRotationDto } from './dto/create-rotation.dto';
import { UpdateRotationDto } from './dto/update-rotation.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ReorderMembersDto } from './dto/reorder-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { getPEIHolidays } from 'src/utils/holidays';
import { RotationSnapshotService } from './rotation_audit_snapshot.service';
import { AuditWriter } from 'src/audit/audit-writer.service';


@Injectable()
export class RotationsService {
    constructor(private readonly prisma: PrismaService,
        private readonly audit: AuditWriter,
        private readonly snapshot: RotationSnapshotService,
    ) { }

    async create(dto: CreateRotationDto, userId: string) {
        const rotation = await this.prisma.rotation_definitions.create({
            data: {
                name: dto.name,
                code: dto.code,

                type: dto.type as RotationType,
                cadence: dto.cadence as RotationCadence,
                cadence_interval: dto.cadence_interval ?? 1,

                priority: dto.priority ?? 100,

                allow_overlap: dto.allow_overlap ?? false,
                min_assignees: dto.min_assignees ?? 1,
                max_assignees: dto.max_assignees ?? 1,

                scope_type: dto.scope_type as RotationScope,
                scope_ref_id: dto.scope_ref_id ?? null,

                start_date: dto.start_date,
                end_date: dto.end_date ?? null,

                effective_date: dto.effective_date ?? new Date(),
                freeze_date: dto.freeze_date ?? null,

                owner_id: dto.owner_id ?? null,
                description: dto.description ?? null,

                is_active: dto.is_active ?? true,
            },
        });
        await this.audit.rotation.created(userId, rotation.id, dto);
        await this.snapshot.createSnapshot(rotation.id);

        return rotation;
    }

    async findAll() {
        return this.prisma.rotation_definitions.findMany({
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string) {
        const rotation = await this.prisma.rotation_definitions.findUnique({
            where: { id },
            include: {
                rotation_members: {
                    orderBy: { order_index: 'asc' },
                },
                rotation_tiers: {
                    orderBy: { tier_level: 'asc' },
                    include: {
                        rotation_tier_members: {
                            orderBy: { order_index: 'asc' },
                        },
                    },
                },
            },
        });

        if (!rotation) {
            throw new NotFoundException(`Rotation ${id} not found`);
        }

        return rotation;
    }

    async update(id: string, dto: UpdateRotationDto, userId: string) {
        await this.ensureExists(id);
        const before = await this.prisma.rotation_definitions.findUnique({ where: { id } });
        if (!before) throw new NotFoundException("Rotation not found");
        const after = await this.prisma.rotation_definitions.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.code !== undefined && { code: dto.code }),
                ...(dto.type !== undefined && { type: dto.type as RotationType }),
                ...(dto.cadence !== undefined && {
                    cadence: dto.cadence as RotationCadence,
                }),
                ...(dto.cadence_interval !== undefined && {
                    cadence_interval: dto.cadence_interval,
                }),
                ...(dto.allow_overlap !== undefined && {
                    allow_overlap: dto.allow_overlap,
                }),
                ...(dto.min_assignees !== undefined && {
                    min_assignees: dto.min_assignees,
                }),
                ...(dto.scope_type !== undefined && {
                    scope_type: dto.scope_type as RotationScope,
                }),
                ...(dto.scope_ref_id !== undefined && {
                    scope_ref_id: dto.scope_ref_id,
                }),

                ...(dto.start_date !== undefined && { start_date: dto.start_date }),
                ...(dto.end_date !== undefined && { end_date: dto.end_date }),

                ...(dto.owner_id !== undefined && { owner_id: dto.owner_id }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.is_active !== undefined && { is_active: dto.is_active }),
            },
        });
        await this.audit.rotation.updated(userId, id, before, after);
        await this.snapshot.createSnapshot(id);
        return after;
    }

    async remove(id: string, userId: string) {
        await this.ensureExists(id);

        await this.prisma.$transaction([
            this.prisma.rotation_tier_members.deleteMany({
                where: {
                    rotation_tiers: {
                        rotation_definition_id: id,
                    },
                },
            }),
            this.prisma.rotation_tiers.deleteMany({
                where: { rotation_definition_id: id },
            }),
            this.prisma.rotation_members.deleteMany({
                where: { rotation_definition_id: id },
            }),
            this.prisma.rotation_definitions.delete({
                where: { id },
            }),
        ]);

        await this.audit.rotation.deleted(userId, id);

        return { id };
    }

    async findMembers(rotationId: string) {
        await this.ensureExists(rotationId);

        return this.prisma.rotation_members.findMany({
            where: { rotation_definition_id: rotationId },
            orderBy: { order_index: 'asc' },
        });
    }

    async addMember(rotationId: string, dto: AddMemberDto, userId: string) {
        await this.ensureExists(rotationId);

        const count = await this.prisma.rotation_members.count({
            where: { rotation_definition_id: rotationId },
        });

        const member = await this.prisma.rotation_members.create({
            data: {
                rotation_definition_id: rotationId,
                member_type: dto.member_type as RotationMemberType,
                member_ref_id: dto.member_ref_id,
                order_index: count,
                is_active: true,
            },
        });
        await this.audit.rotation.memberAdded(userId, rotationId, dto);
        await this.snapshot.createSnapshot(rotationId);
        return member;
    }

    async removeMember(memberId: string, userId: string) {
        const exists = await this.prisma.rotation_members.findUnique({
            where: { id: memberId },
        });

        if (!exists) {
            throw new NotFoundException(`Rotation member ${memberId} not found`);
        }

        await this.prisma.rotation_members.delete({
            where: { id: memberId },
        });

        await this.audit.rotation.memberRemoved(
            userId,
            exists.rotation_definition_id,
            { memberId },
        );
        await this.audit.rotation.memberRemoved(userId, exists.rotation_definition_id, { memberId });
        await this.snapshot.createSnapshot(exists.rotation_definition_id);

        return { id: memberId };
    }

    async reorderMembers(rotationId: string, dto: ReorderMembersDto, userId: string) {
        await this.ensureExists(rotationId);

        await this.prisma.$transaction(
            dto.items.map((item) =>
                this.prisma.rotation_members.update({
                    where: { id: item.id },
                    data: { order_index: item.order_index },
                }),
            ),
        );
        await this.audit.rotation.reordered(userId, rotationId, dto);
        await this.snapshot.createSnapshot(rotationId);
        return this.findMembers(rotationId);
    }
    async updateMember(memberId: string, dto: UpdateMemberDto, userId: string) {
        const member = await this.prisma.rotation_members.update({
            where: { id: memberId },
            data: dto,
        });
        await this.snapshot.createSnapshot(member.rotation_definition_id);

        return member;
    }

    private async ensureExists(id: string) {
        const exists = await this.prisma.rotation_definitions.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!exists) {
            throw new NotFoundException(`Rotation ${id} not found`);
        }
    }

    @Get(':id/schedule')
    async getSchedule(@Param('id') id: string) {
        const rotation = await this.prisma.rotation_definitions.findUnique({
            where: { id },
        });

        const results = await this.prisma.schedule_results.findMany({
            where: { rotation_id: id },
            orderBy: { date: 'asc' },
        });

        const allAssigneeIds = results
            .flatMap(r =>
                Array.isArray(r.assignees)
                    ? (r.assignees as unknown[]).filter((x): x is string => typeof x === "string")
                    : []
            );

        const users = await this.prisma.users.findMany({
            where: { id: { in: allAssigneeIds } },
            select: { id: true, first_name: true, last_name: true },
        });

        const userMap = Object.fromEntries(
            users.map(u => [u.id, `${u.first_name} ${u.last_name}`.trim()])
        );

        const tiers = await this.prisma.rotation_tiers.findMany({
            where: { rotation_definition_id: id },
            select: { tier_level: true, name: true },
        });

        const tierMap = Object.fromEntries(
            tiers.map(t => [t.tier_level, t.name])
        );
        
        const calendar = results.map(r => {
            const rawAssignees = Array.isArray(r.assignees)
                ? (r.assignees as unknown[]).filter((x): x is string => typeof x === "string")
                : [];

            const rawConflicts = Array.isArray(r.conflicts)
                ? (r.conflicts as unknown[]).filter((x): x is string => typeof x === "string")
                : [];

            return {
                id: r.id,
                title: `Tier ${r.tier_level}`,
                start: r.date.toISOString(),
                end: r.date.toISOString(),
                rotationId: r.rotation_id,

                assignees: rawAssignees.map(id => userMap[id] ?? id),

                conflictFlags: rawConflicts,
                ruleViolations: [],
                tier: r.tier_level,
                tierName: tierMap[r.tier_level] ?? null,
                overrideFlags: r.override_flag ? ['override'] : [],
            };
        });

        const timelineRaw = results.flatMap(r => {
            const assignees = Array.isArray(r.assignees)
                ? (r.assignees as unknown[]).filter((x): x is string => typeof x === "string")
                : [];

            return assignees.map(userId => ({
                userId,
                userName: userMap[userId] ?? userId,
                rotationId: r.rotation_id,
                start: r.date.toISOString(),
                end: r.date.toISOString(),
                tier: r.tier_level,
                conflictFlags: Array.isArray(r.conflicts)
                    ? (r.conflicts as unknown[]).filter((x): x is string => typeof x === "string")
                    : [],
                ruleViolations: [],
            }));
        });

        const timeline = mergeTimeline(timelineRaw);
        // Auto load Pei Holidays
        const years = new Set(results.map(r => r.date.getFullYear()));
        const holidays = [...years].flatMap(y => getPEIHolidays(y));

        return {
            rotationId: id,
            name: rotation?.name ?? '',
            from: results[0]?.date.toISOString() ?? '',
            to: results.at(-1)?.date.toISOString() ?? '',

            days: [],
            calendar,
            timeline,
            daily: [],
            weekly: [],
            monthly: [],
            holidays,
        };
    }
}


function mergeTimeline(items: any[]) {
    const grouped: Record<string, any[]> = {};

    for (const item of items) {
        const key = `${item.userId}-${item.tier}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
    }

    const merged: any[] = [];

    for (const key in grouped) {
        const list = grouped[key].sort((a, b) => a.start.localeCompare(b.start));

        let current = list[0];

        for (let i = 1; i < list.length; i++) {
            const next = list[i];

            const currentEnd = new Date(current.end);
            const nextStart = new Date(next.start);

            const diffDays =
                (nextStart.getTime() - currentEnd.getTime()) / (1000 * 3600 * 24);

            if (diffDays === 1) {
                current.end = next.end;
            } else {
                merged.push(current);
                current = next;
            }
        }

        merged.push(current);
    }

    return merged;
}