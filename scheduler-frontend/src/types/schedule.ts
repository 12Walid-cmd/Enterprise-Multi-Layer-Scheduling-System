export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  rotationId: string;
  assignees: string[];
  conflictFlags: string[];
  ruleViolations: string[];
  tier: number;               
  overrideFlags: string[];
}

export interface TimelineItem {
  userId: string;
  userName: string;     
  rotationId: string;

  start: string;        // ISO string
  end: string;          // ISO string

  tier: number;

  conflictFlags: string[];
  ruleViolations: string[];

  color?: string;       
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
  capacity: number;
}

export interface WeeklyProjection {
  weekStart: string;
  weekEnd: string;
  totalAssignees: number;
  conflicts: number;
  violations: number;
  capacity: number;
}

export interface MonthlyProjection {
  month: string; // YYYY-MM
  totalAssignees: number;
  conflicts: number;
  violations: number;
  capacity: number;
}

export interface ScheduleResponse {
  name: string;
  rotationId: string;
  from: string;
  to: string;

  days: ConflictCheckedDay[];

  calendar: CalendarEvent[];
  timeline: TimelineItem[];

  daily: DailyProjection[];
  weekly: WeeklyProjection[];
  monthly: MonthlyProjection[];

  holidays: { name: string; date: string }[];
}