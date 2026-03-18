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

  /**
   * Load a rotation by ID and fully expand tiers + members.
   */
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
    };

    return loaded;
  }

  /**
   * Convert DB member row → RotationTierMember
   */
  private mapMember(row: any): RotationTierMember {
    return {
      id: row.member_ref_id,
      type: row.member_type as RotationMemberType,
      weight: row.weight,
      orderIndex: row.order_index,
      isActive: row.is_active,
    };
  }
}