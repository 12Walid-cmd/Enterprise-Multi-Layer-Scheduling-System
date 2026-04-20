// schedule.engine.ts

import { Injectable } from '@nestjs/common';
import { LoadedRotation, DailyAssignment, ScheduleContext } from './schedule.types';
import { ConstraintPipeline } from './schedule.constraint.pipeline';
import { RuleEngineService } from './rule.engine.service';

import { getPEIHolidays } from "../utils/holidays";


@Injectable()
export class ScheduleEngine {
  constructor(private readonly pipeline: ConstraintPipeline) { }

  /**
   * Generate schedule for a rotation between startDate and endDate.
   */
  async generate(
    rotation: LoadedRotation,
    context: ScheduleContext,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyAssignment[]> {
    const ruleEngine = new RuleEngineService(rotation.rules);
    context.ruleEngine = ruleEngine;

    // load PEI holiday
    const year = startDate.getFullYear();
    context.holidays = getPEIHolidays(year).map(h => h.date);

    // FIXED_BLOCK override
    if (ruleEngine.has("FIXED_BLOCK")) {
      return this.generateFixedBlock(rotation, context, startDate, endDate);
    }

    const assignments: DailyAssignment[] = [];

    const cur = new Date(startDate);

    while (cur <= endDate) {
      const date = new Date(cur);

      // SKIP_WEEKENDS
      if (ruleEngine.has("SKIP_WEEKENDS") && (date.getDay() === 0 || date.getDay() === 6)) {
        cur.setDate(cur.getDate() + 1);
        continue;
      }

      // SKIP_HOLIDAYS
      if (ruleEngine.has("SKIP_HOLIDAYS") &&
        context.holidays.some(h => h.toDateString() === date.toDateString())) {
        cur.setDate(cur.getDate() + 1);
        continue;
      }
      // // forever skip holidays (scope-level)
      // if (context.holidays.some(h => h.toDateString() === date.toDateString())) {
      //   cur.setDate(cur.getDate() + 1);
      //   continue;
      // }

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
    const ruleEngine = context.ruleEngine!;
    let pool = this.expandWeightedPool(members);

    // SKIP_INACTIVE
    if (ruleEngine.has("SKIP_INACTIVE")) {
      pool = pool.filter(m => m.isActive);
    }

    // SEQUENTIAL
    if (ruleEngine.has("SEQUENTIAL")) {
      pool.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    // RANDOMIZED
    if (ruleEngine.has("RANDOMIZED")) {
      pool = shuffle(pool);
    }

    // ROUND_ROBIN
    if (ruleEngine.has("ROUND_ROBIN")) {
      context.lastAssigned ??= {};
      context.lastAssigned[rotation.id] ??= {};
      context.lastAssigned[rotation.id][tierLevel] ??= 0;

      const last = context.lastAssigned[rotation.id][tierLevel];
      pool = rotate(pool, last);
      context.lastAssigned[rotation.id][tierLevel] = last + 1;

    }


    const min = ruleEngine.payload("MIN_STAFF")?.min ?? rotation.minAssignees;
    const max = ruleEngine.payload("MAX_STAFF")?.max ?? rotation.maxAssignees;
    const results: DailyAssignment[] = [];

    let assignedCount = 0;

    for (const member of pool) {
      if (assignedCount >= max) break;

      const userId = await this.resolveUser(member);
      if (!userId) continue;

      const ok = this.pipeline.validate(userId, date, rotation, context, allAssignments);
      if (!ok) continue;

      results.push({
        date,
        rotationId: rotation.id,
        tierLevel,
        assigneeRefId: userId,
      });

      assignedCount++;

      if (assignedCount >= min) break;
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


  private generateFixedBlock(
    rotation: LoadedRotation,
    context: ScheduleContext,
    startDate: Date,
    endDate: Date,
  ): DailyAssignment[] {
    const ruleEngine = context.ruleEngine!;
    const globalBlock = ruleEngine.payload("FIXED_BLOCK")?.days ?? 1;
    const perTierBlock = ruleEngine.payload("FIXED_BLOCK")?.perTier ?? {};

    const assignments: DailyAssignment[] = [];

    for (const tier of rotation.tiers) {
      const members = tier.members;
      if (!members || members.length === 0) continue;

      const blockSize = perTierBlock[tier.tierLevel] ?? globalBlock;

      let cur = new Date(startDate);
      let memberIndex = 0;

      while (cur <= endDate) {
        const member = members[memberIndex % members.length];
        const userId = member.id;

        let assignedDays = 0;

        while (assignedDays < blockSize && cur <= endDate) {

          //  SKIP_WEEKENDS
          if (ruleEngine.has("SKIP_WEEKENDS") &&
            (cur.getDay() === 0 || cur.getDay() === 6)) {
            cur.setDate(cur.getDate() + 1);
            continue;
          }

          // SKIP_HOLIDAYS
          if (ruleEngine.has("SKIP_HOLIDAYS") &&
            context.holidays.some(h => h.toDateString() === cur.toDateString())) {
            cur.setDate(cur.getDate() + 1);
            continue;
          }

          assignments.push({
            date: new Date(cur),
            rotationId: rotation.id,
            tierLevel: tier.tierLevel,
            assigneeRefId: userId,
          });

          assignedDays++;
          cur.setDate(cur.getDate() + 1);
        }

        memberIndex++;
      }
    }

    return assignments;
  }

}

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map(v => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

function rotate<T>(arr: T[], n: number): T[] {
  const len = arr.length;
  if (len === 0) return arr;
  const shift = n % len;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}