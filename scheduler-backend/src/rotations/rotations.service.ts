import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class RotationsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateRotationDto) {
        return this.prisma.rotation_definitions.create({
            data: {
                name: dto.name,
                code: dto.code,

                type: dto.type as RotationType,
                cadence: dto.cadence as RotationCadence,
                cadence_interval: dto.cadence_interval ?? 1,

                allow_overlap: dto.allow_overlap ?? false,
                min_assignees: dto.min_assignees ?? 1,

                scope_type: dto.scope_type as RotationScope,
                scope_ref_id: dto.scope_ref_id ?? null,

                start_date: dto.start_date,
                end_date: dto.end_date ?? null,

                owner_id: dto.owner_id ?? null,
                description: dto.description ?? null,

                is_active: dto.is_active ?? true,

            },
        });
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

    async update(id: string, dto: UpdateRotationDto) {
        await this.ensureExists(id);

        return this.prisma.rotation_definitions.update({
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
    }

    async remove(id: string) {
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

        return { id };
    }

    async findMembers(rotationId: string) {
        await this.ensureExists(rotationId);

        return this.prisma.rotation_members.findMany({
            where: { rotation_definition_id: rotationId },
            orderBy: { order_index: 'asc' },
        });
    }

    async addMember(rotationId: string, dto: AddMemberDto) {
        await this.ensureExists(rotationId);

        const count = await this.prisma.rotation_members.count({
            where: { rotation_definition_id: rotationId },
        });

        return this.prisma.rotation_members.create({
            data: {
                rotation_definition_id: rotationId,
                member_type: dto.member_type as RotationMemberType,
                member_ref_id: dto.member_ref_id,
                order_index: count,
                is_active: true,
            },
        });
    }

    async removeMember(memberId: string) {
        const exists = await this.prisma.rotation_members.findUnique({
            where: { id: memberId },
        });

        if (!exists) {
            throw new NotFoundException(`Rotation member ${memberId} not found`);
        }

        await this.prisma.rotation_members.delete({
            where: { id: memberId },
        });

        return { id: memberId };
    }

    async reorderMembers(rotationId: string, dto: ReorderMembersDto) {
        await this.ensureExists(rotationId);

        await this.prisma.$transaction(
            dto.items.map((item) =>
                this.prisma.rotation_members.update({
                    where: { id: item.id },
                    data: { order_index: item.order_index },
                }),
            ),
        );

        return this.findMembers(rotationId);
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
}