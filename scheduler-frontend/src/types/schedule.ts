export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  rotationId: string;
  assignees: string[];
  conflictFlags: string[];
  ruleViolations: string[];
}

export interface TimelineItem {
  userId: string;
  rotationId: string;
  start: string; // ISO string
  end: string;   // ISO string
  conflictFlags: string[];
  ruleViolations: string[];
}

export interface ConflictCheckedDay {
  date: string; // ISO string
  assignees: string[];
  unavailable: string[];
  conflicts: string[];
  ruleViolations: string[];
  conflictFlags: string[];
}

export interface DailyProjection {
  date: string;
  totalAssignees: number;
  conflicts: number;
  violations: number;
}

export interface WeeklyProjection {
  weekStart: string;
  weekEnd: string;
  totalAssignees: number;
  conflicts: number;
  violations: number;
}

export interface MonthlyProjection {
  month: string; // YYYY-MM
  totalAssignees: number;
  conflicts: number;
  violations: number;
}

export interface ScheduleResponse {
  rotationId: string;
  from: string;
  to: string;

  days: ConflictCheckedDay[];

  calendar: CalendarEvent[];
  timeline: TimelineItem[];

  daily: DailyProjection[];
  weekly: WeeklyProjection[];
  monthly: MonthlyProjection[];
}