import { LeaveProcessedDay } from './leave-processed-day';

export interface RuleProcessedDay extends LeaveProcessedDay {
  ruleViolations: string[];
}