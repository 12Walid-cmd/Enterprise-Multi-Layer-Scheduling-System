import { Injectable } from '@nestjs/common';
import { LeaveProcessedDay } from './leave-blocker';
import { RotationsService } from '../../rotations/rotations.service';
import { OrgService } from '../../org/org.service';

export interface RuleProcessedDay extends LeaveProcessedDay {
  ruleViolations: string[];
}

@Injectable()
export class RulesApplier {
  constructor(
    private readonly rotationsService: RotationsService,
    private readonly orgService: OrgService,
  ) {}


  async apply(days: LeaveProcessedDay[]): Promise<RuleProcessedDay[]> {
    const result: RuleProcessedDay[] = [];

    for (const day of days) {
      const ruleViolations: string[] = [];

      const fairness = await this.checkFairness(day);
      if (fairness) ruleViolations.push(fairness);

      const coverage = await this.checkCoverage(day);
      if (coverage) ruleViolations.push(coverage);

      const domainRule = await this.checkDomainRules(day);
      if (domainRule) ruleViolations.push(domainRule);

      const customRule = await this.checkCustomRules(day);
      if (customRule) ruleViolations.push(customRule);

      result.push({
        ...day,
        ruleViolations,
      });
    }

    return result;
  }


  private async checkFairness(day: LeaveProcessedDay): Promise<string | null> {
    if (day.assignees.length < 1) return null;


    const unique = new Set(day.assignees);
    if (unique.size !== day.assignees.length) {
      return 'FAIRNESS_VIOLATION_DUPLICATE_ASSIGNEE';
    }

    return null;
  }



  private async checkCoverage(day: LeaveProcessedDay): Promise<string | null> {
    const rotation = await this.rotationsService.getOne(day.rotationId);
    if (!rotation) return null;

    const min = rotation.min_assignees ?? 1;

    if (day.assignees.length < min) {
      return `COVERAGE_INSUFFICIENT_${day.assignees.length}_OF_${min}`;
    }

    return null;
  }


  private async checkDomainRules(
    day: LeaveProcessedDay,
  ): Promise<string | null> {
    const rotation = await this.rotationsService.getOne(day.rotationId);
    if (!rotation) return null;

    if (rotation.scope_type === 'DOMAIN') {
      const domain = await this.orgService.getDomain(rotation.scope_id);

      if (domain?.requires_specialist) {
        const hasSpecialist = await this.orgService.hasSpecialist(
          day.assignees,
          domain.id,
        );

        if (!hasSpecialist) {
          return 'DOMAIN_RULE_VIOLATION_NO_SPECIALIST';
        }
      }
    }

    return null;
  }


  private async checkCustomRules(
    day: LeaveProcessedDay,
  ): Promise<string | null> {
    return null;
  }
}