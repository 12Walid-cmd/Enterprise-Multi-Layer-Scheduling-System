// rotation.loader.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  LoadedRotation,
  RotationTier,
  RotationTierMember,
  RotationMemberType,
} from './schedule.types';

@Injectable()
export class RotationLoader {
  constructor(private readonly prisma: PrismaService) {}

  async loadRotation(rotationId: string): Promise<LoadedRotation> {
    const rotation = await this.prisma.rotation_definitions.findUnique({
      where: { id: rotationId },
      include: {
        rotation_tiers: {
          orderBy: { tier_level: 'asc' },
          include: {
            rotation_tier_members: {
              where: { is_active: true },
              orderBy: { order_index: 'asc' },
            },
          },
        },

        rotationRules: true,
      },
    });

    if (!rotation) {
      throw new Error(`Rotation not found: ${rotationId}`);
    }

    // Map tiers
    const tiers: RotationTier[] = rotation.rotation_tiers.map((tier) => ({
      tierLevel: tier.tier_level,
      members: tier.rotation_tier_members.map((m) => this.mapMember(m)),
    }));

    // Map rules
    const rules = rotation.rotationRules.map((r) => ({
      id: r.id,
      type: r.rule_type,
      payload: r.rule_payload,
      enabled: r.enabled,
    }));

    // Build LoadedRotation
    const loaded: LoadedRotation = {
      id: rotation.id,
      name: rotation.name,
      code: rotation.code,

      type: rotation.type,

      cadence: rotation.cadence,
      cadenceInterval: rotation.cadence_interval,

      priority: rotation.priority,
      allowOverlap: rotation.allow_overlap,
      minAssignees: rotation.min_assignees,
      maxAssignees: rotation.max_assignees,

      scopeType: rotation.scope_type,
      scopeRefId: rotation.scope_ref_id,

      startDate: rotation.start_date,
      endDate: rotation.end_date,

      effectiveDate: rotation.effective_date,
      freezeDate: rotation.freeze_date,

      ownerId: rotation.owner_id,

      tiers,
      rules,   
    };

    return loaded;
  }

  private mapMember(row: any): RotationTierMember {
    return {
      id: row.member_ref_id,
      type: row.member_type,
      weight: row.weight,
      orderIndex: row.order_index,
      isActive: row.is_active,
    };
  }
}