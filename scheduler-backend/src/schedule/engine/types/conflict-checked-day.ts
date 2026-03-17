import { RuleProcessedDay } from './rule-processed-day';

export interface ConflictCheckedDay extends RuleProcessedDay {
  conflictFlags: string[];
}