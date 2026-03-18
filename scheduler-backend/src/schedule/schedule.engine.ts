// schedule.engine.ts

import { Injectable } from '@nestjs/common';
import { LoadedRotation, DailyAssignment, ScheduleContext } from './schedule.types';
import { ConstraintPipeline } from './schedule.constraint.pipeline';

@Injectable()
export class ScheduleEngine {
  constructor(private readonly pipeline: ConstraintPipeline) {}

  /**
   * Generate schedule for a rotation between startDate and endDate.
   */
  async generate(
    rotation: LoadedRotation,
    context: ScheduleContext,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyAssignment[]> {
    const assignments: DailyAssignment[] = [];

    const cur = new Date(startDate);

    while (cur <= endDate) {
      const date = new Date(cur);

      // skip before effectiveDate
      if (date < rotation.effectiveDate) {
        cur.setDate(cur.getDate() + 1);
        continue;
      }

      // skip after freezeDate
      if (rotation.freezeDate && date >= rotation.freezeDate) {
        cur.setDate(cur.getDate() + 1);
        continue;
      }

      // skip holidays (scope-level)
      if (context.holidays.some(h => h.toDateString() === date.toDateString())) {
        cur.setDate(cur.getDate() + 1);
        continue;
      }

      // generate assignments for this day
      const dayAssignments = await this.assignForDay(rotation, context, date, assignments);

      assignments.push(...dayAssignments);

      cur.setDate(cur.getDate() + 1);
    }

    return assignments;
  }

  /**
   * Assign members for a single day.
   */
  private async assignForDay(
    rotation: LoadedRotation,
    context: ScheduleContext,
    date: Date,
    allAssignments: DailyAssignment[],
  ): Promise<DailyAssignment[]> {
    const results: DailyAssignment[] = [];

    for (const tier of rotation.tiers) {
      const tierAssignments = await this.assignTier(
        rotation,
        tier.tierLevel,
        tier.members,
        context,
        date,
        allAssignments,
      );

      results.push(...tierAssignments);
    }

    return results;
  }

  /**
   * Assign members for a single tier.
   */
  private async assignTier(
    rotation: LoadedRotation,
    tierLevel: number,
    members: any[],
    context: ScheduleContext,
    date: Date,
    allAssignments: DailyAssignment[],
  ): Promise<DailyAssignment[]> {
    const results: DailyAssignment[] = [];

    // Weighted RR: expand members by weight
    const weightedPool = this.expandWeightedPool(members);

    let assignedCount = 0;

    for (const member of weightedPool) {
      if (assignedCount >= rotation.maxAssignees) break;

      const userId = await this.resolveUser(member);

      if (!userId) continue;

      const ok = this.pipeline.validate(
        userId,
        date,
        rotation,
        context,
        allAssignments,
      );

      if (!ok) continue;

      results.push({
        date,
        rotationId: rotation.id,
        tierLevel,
        assigneeRefId: userId,
      });

      assignedCount++;

      if (assignedCount >= rotation.minAssignees) break;
    }

    return results;
  }

  /**
   * Weighted RR: expand members by weight.
   */
  private expandWeightedPool(members: any[]): any[] {
    const pool: any[] = [];

    for (const m of members) {
      for (let i = 0; i < m.weight; i++) {
        pool.push(m);
      }
    }

    return pool;
  }

  /**
   * Resolve a member to a user_id.
   * Supports:
   * - USER
   * - TEAM
   * - SUBTEAM
   * - DOMAIN_TEAM
   * - GLOBAL_ROLE
   * - TEAM_ROLE
   */
  private async resolveUser(member: any): Promise<string | null> {
    switch (member.type) {
      case 'USER':
        return member.id;

      case 'TEAM':
      case 'SUBTEAM':
        return this.pickRandomUserFromTeam(member.id);

      case 'DOMAIN_TEAM':
        return this.pickRandomUserFromDomainTeam(member.id);

      case 'GLOBAL_ROLE':
        return this.pickRandomUserFromGlobalRole(member.id);

      case 'TEAM_ROLE':
        return this.pickRandomUserFromTeamRole(member.id);

      default:
        return null;
    }
  }

  private async pickRandomUserFromTeam(teamId: string): Promise<string | null> {
    // TODO: implement with prisma.team_members
    return null;
  }

  private async pickRandomUserFromDomainTeam(domainTeamId: string): Promise<string | null> {
    // TODO: implement with prisma.domain_teams
    return null;
  }

  private async pickRandomUserFromGlobalRole(globalRoleId: string): Promise<string | null> {
    // TODO: implement with prisma.user_roles
    return null;
  }

  private async pickRandomUserFromTeamRole(teamRoleId: string): Promise<string | null> {
    // TODO: implement with prisma.team_members
    return null;
  }
}