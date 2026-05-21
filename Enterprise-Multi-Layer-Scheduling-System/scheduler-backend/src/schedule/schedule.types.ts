// schedule.types.ts

import {
  RotationType,
  RotationScope,
  RotationCadence,
  RotationMemberType,
} from '@prisma/client';
import { RuleEngineService } from './rule.engine.service';

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
  id: string;          // user_id
  type: string;        // USER / TEAM / ROLE
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


export interface LoadedRotationRule {
  id: string;
  type: string;     // RotationRuleType
  payload: any;     // rule_payload
  enabled?: boolean;
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
  rules: LoadedRotationRule[];

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
  lastAssigned: Record<string, Record<number, number>>; // rotationId -> tierLevel -> last assigned index in that tier (for round-robin)
  ruleEngine?: RuleEngineService; // add ruleEngine to context,use ConstraintPipeline to inject it into constraints
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

export const CONSTRAINTS = 'CONSTRAINTS';