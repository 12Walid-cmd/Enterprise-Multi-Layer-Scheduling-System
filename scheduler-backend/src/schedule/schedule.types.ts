// schedule.types.ts

import {
  RotationType,
  RotationScope,
  RotationCadence,
  RotationMemberType,
} from '@prisma/client';

export {
  RotationType,
  RotationScope,
  RotationCadence,
  RotationMemberType,
} from '@prisma/client';

/**
 * RotationTierMember
 * - A single member inside a tier
 * - Could be: user / team / subteam / domain-team / global-role / team-role
 */
export interface RotationTierMember {
  id: string; // user_id OR team_id OR domain_team_id OR global_role_id OR team_role_id
  type: RotationMemberType;
  weight: number;
  orderIndex: number;
  isActive: boolean;
}

/**
 * RotationTier
 * - A tier inside a rotation (e.g., primary, secondary)
 */
export interface RotationTier {
  tierLevel: number;
  members: RotationTierMember[];
}

/**
 * LoadedRotation
 * - Fully expanded rotation definition loaded from DB
 * - Used by ScheduleEngine
 */
export interface LoadedRotation {
  id: string;
  name: string;
  code: string;

  type: RotationType;

  cadence: RotationCadence;
  cadenceInterval: number;

  priority: number;
  allowOverlap: boolean;
  minAssignees: number;
  maxAssignees: number;

  scopeType: RotationScope;
  scopeRefId: string | null;

  startDate: Date;
  endDate: Date | null;

  effectiveDate: Date;
  freezeDate: Date | null;

  ownerId: string | null;

  tiers: RotationTier[];
}

/**
 * DailyAssignment
 * - A single day's assignment result
 */
export interface DailyAssignment {
  date: Date;
  rotationId: string;
  tierLevel: number;
  assigneeRefId: string; // user_id
}

/**
 * ScheduleContext (A3: scope-level + user-level holidays)
 */
export interface ScheduleContext {
  holidays: Date[]; // scope-level holidays (global + group + team + subteam + domain + domain-team + role)
  leaveByUserId: Map<string, Date[]>; // user leave
  userHolidayMap: Map<string, Date[]>; // user-level holidays (derived from org structure)
}

/**
 * Constraint interface
 * - All constraints implement this
 */
export interface Constraint {
  name: string;

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean;
}