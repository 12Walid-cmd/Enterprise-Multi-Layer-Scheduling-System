import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { AddTierMemberDto } from './dto/add-tier-member.dto';

@Injectable()
export class TierService {
    constructor(private prisma: PrismaService) { }

    async createTier(rotationId: string, dto: CreateTierDto) {
        const tier = await this.prisma.rotation_tiers.create({
            data: {
                rotation_definition_id: rotationId,
                tier_level: dto.tier_level,
                name: dto.name,
            },
        });

        const rotationMembers = await this.prisma.rotation_members.findMany({
            where: { rotation_definition_id: rotationId },
        });

        if (rotationMembers.length > 0) {
            await this.prisma.rotation_tier_members.createMany({
                data: rotationMembers.map((m, index) => ({
                    tier_id: tier.id,
                    member_type: 'USER',
                    member_ref_id: m.member_ref_id,
                    weight: 1,
                    order_index: index,
                    is_active: true,
                })),
            });
        }

        return tier;
    }



    async getTiers(rotationId: string) {
        return this.prisma.rotation_tiers.findMany({
            where: { rotation_definition_id: rotationId },
            orderBy: { tier_level: 'asc' },
        });
    }

    async addMember(tierId: string, dto: AddTierMemberDto) {
        return this.prisma.rotation_tier_members.create({
            data: {
                tier_id: tierId,
                member_type: dto.memberType,
                member_ref_id: dto.memberRefId,
                weight: dto.weight,
            },
        });
    }

    async getMembers(tierId: string) {
        return this.prisma.rotation_tier_members.findMany({
            where: { tier_id: tierId },
            orderBy: { order_index: 'asc' },
        });
    }

    async removeMember(memberId: string) {
        return this.prisma.rotation_tier_members.delete({
            where: { id: memberId },
        });
    }

    async deleteTier(tierId: string) {

        await this.prisma.rotation_tier_members.deleteMany({
            where: { tier_id: tierId },
        });


        return this.prisma.rotation_tiers.delete({
            where: { id: tierId },
        });
    }
}