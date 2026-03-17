import { Injectable } from '@nestjs/common';
import { RuleProcessedDay } from './rules-applier';
import { OrgService } from '../../org/org.service';
import { RotationsService } from '../../rotations/rotations.service';

export interface ConflictCheckedDay extends RuleProcessedDay {
  conflictFlags: string[];
}

@Injectable()
export class ConflictChecker {
  constructor(
    private readonly orgService: OrgService,
    private readonly rotationsService: RotationsService,
  ) {}

  /**
   * - double-booking（
   * - leave conflicts
   * - coverage conflicts
   * - domain conflicts
   * - cross-team conflicts（
   */
  async check(days: RuleProcessedDay[]): Promise<ConflictCheckedDay[]> {
    const result: ConflictCheckedDay[] = [];

   
    const dateToUsers = new Map<string, Map<string, string[]>>();

   
    for (const day of days) {
      const key = day.date.toISOString().split('T')[0];

      if (!dateToUsers.has(key)) {
        dateToUsers.set(key, new Map());
      }

      const userMap = dateToUsers.get(key)!;

      for (const userId of day.assignees) {
        if (!userMap.has(userId)) {
          userMap.set(userId, []);
        }
        userMap.get(userId)!.push(day.rotationId);
      }
    }

    
    for (const day of days) {
      const conflictFlags: string[] = [];

      // 1. leave conflict（ leave-blocker）
      if (day.unavailable.length > 0) {
        conflictFlags.push('LEAVE_CONFLICT');
      }

      // 2. coverage conflict（ rules-applier）
      if (day.ruleViolations.some((v) => v.startsWith('COVERAGE'))) {
        conflictFlags.push('COVERAGE_CONFLICT');
      }

      // 3. double-booking conflict
      const key = day.date.toISOString().split('T')[0];
      const userMap = dateToUsers.get(key)!;

      for (const userId of day.assignees) {
        const rotations = userMap.get(userId)!;
        if (rotations.length > 1) {
          conflictFlags.push('DOUBLE_BOOKING');
          break;
        }
      }

      
      const rotation = await this.rotationsService.getOne(day.rotationId);
      if (rotation?.scope_type === 'DOMAIN') {
        const domain = await this.orgService.getDomain(rotation.scope_id);

        if (domain?.exclusive) {
          for (const userId of day.assignees) {
            const rotations = userMap.get(userId)!;
            if (rotations.length > 1) {
              conflictFlags.push('DOMAIN_EXCLUSIVE_CONFLICT');
              break;
            }
          }
        }
      }

      // 5. cross-team conflict
      if (rotation?.scope_type === 'TEAM') {
        const team = await this.orgService.getTeam(rotation.scope_id);

        if (team?.disallow_cross_team) {
          for (const userId of day.assignees) {
            const rotations = userMap.get(userId)!;
            if (rotations.length > 1) {
              conflictFlags.push('CROSS_TEAM_CONFLICT');
              break;
            }
          }
        }
      }

      result.push({
        ...day,
        conflictFlags,
      });
    }

    return result;
  }
}