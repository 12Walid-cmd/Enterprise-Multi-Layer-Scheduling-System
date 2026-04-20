// calendar.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoadedRotation, ScheduleContext } from './schedule.types';
import { RotationScope } from '@prisma/client';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Build schedule context for a rotation:
   * - scope-level holidays
   * - user-level holidays
   * - leave
   */
  async buildContext(rotation: LoadedRotation): Promise<ScheduleContext> {
    const scopeHolidayDates = await this.loadScopeLevelHolidays(rotation);
    const leaveByUserId = await this.loadLeave();
    const userHolidayMap = await this.loadUserLevelHolidays(rotation);

    return {
      holidays: scopeHolidayDates,
      leaveByUserId,
      userHolidayMap,
      lastAssigned: {},
      ruleEngine: undefined,
    };
  }

  /**
   * Load holidays that apply to the rotation scope.
   */
  private async loadScopeLevelHolidays(rotation: LoadedRotation): Promise<Date[]> {
    const filters: any[] = [
      {
        // GLOBAL holiday
        group_id: null,
        team_id: null,
        domain_id: null,
        domain_team_id: null,
        global_role_id: null,
        team_role_id: null,
      },
    ];

    switch (rotation.scopeType) {
      case RotationScope.GROUP:
        filters.push({ group_id: rotation.scopeRefId });
        break;

      case RotationScope.TEAM:
        filters.push({ team_id: rotation.scopeRefId });
        break;

      case RotationScope.SUBTEAM:
        filters.push({ team_id: rotation.scopeRefId });
        break;

      case RotationScope.DOMAIN:
        filters.push({ domain_id: rotation.scopeRefId });
        break;

      case RotationScope.DOMAIN_TEAM:
        filters.push({ domain_team_id: rotation.scopeRefId });
        break;

      case RotationScope.ROLE:
        if (rotation.scopeRefId) {
          filters.push({ global_role_id: rotation.scopeRefId });
        }
        break;

      default:
        break;
    }

    const holidays = await this.prisma.holidays.findMany({
      where: {
        OR: filters,
        is_active: true,
      },
    });

    return holidays.map((h) => h.date);
  }

  /**
   * Load approved leave requests.
   */
  private async loadLeave(): Promise<Map<string, Date[]>> {
    const leave = await this.prisma.leave_requests.findMany({
      where: { status: 'APPROVED' },
    });

    const map = new Map<string, Date[]>();

    for (const l of leave) {
      const dates = this.expandDateRange(l.start_date, l.end_date);
      map.set(l.user_id, dates);
    }

    return map;
  }

  /**
   * Load user-level holidays:
   * - user’s group
   * - user’s team
   * - user’s subteam
   * - user’s domain-team
   * - user’s global roles
   * - user’s team roles
   */
  private async loadUserLevelHolidays(rotation: LoadedRotation): Promise<Map<string, Date[]>> {
    const userIds = this.extractAllUserIds(rotation);

    if (userIds.length === 0) return new Map();

    const users = await this.prisma.users.findMany({
      where: { id: { in: userIds } },
      include: {
        group: true,
        team_members: true,
        subTeamMembers: true,
        domainTeams: true,
        user_roles: true,
      },
    });

    const map = new Map<string, Date[]>();

    for (const user of users) {
      const filters: any[] = [];

      // group
      if (user.group_id) filters.push({ group_id: user.group_id });

      // team
      for (const tm of user.team_members) filters.push({ team_id: tm.team_id });

      // subteam
      for (const stm of user.subTeamMembers) filters.push({ team_id: stm.sub_team_id });

      // domain-team
      for (const dt of user.domainTeams) filters.push({ domain_team_id: dt.domain_team_id });

      // global role
      for (const ur of user.user_roles) filters.push({ global_role_id: ur.global_role_id });

      // team role
      // team role holidays
      for (const tm of user.team_members) {
        if (tm.team_role_id) {
          filters.push({ team_role_id: tm.team_role_id });
        }
      }

      const holidays = await this.prisma.holidays.findMany({
        where: { OR: filters, is_active: true },
      });

      map.set(user.id, holidays.map(h => h.date));
    }

    return map;
  }

  /**
   * Extract all user IDs from rotation tiers.
   */
  private extractAllUserIds(rotation: LoadedRotation): string[] {
    const ids = new Set<string>();

    for (const tier of rotation.tiers) {
      for (const m of tier.members) {
        if (m.type === 'USER') {
          ids.add(m.id);
        }
      }
    }

    return [...ids];
  }

  /**
   * Expand date range into individual days.
   */
  private expandDateRange(start: Date, end: Date): Date[] {
    const result: Date[] = [];
    const cur = new Date(start);

    while (cur <= end) {
      result.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return result;
  }
}