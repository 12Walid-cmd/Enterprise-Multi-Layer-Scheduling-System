import { AssignedDay } from './assigned-day';

export interface LeaveProcessedDay extends AssignedDay {
  unavailable: string[];
  conflicts: string[];
}