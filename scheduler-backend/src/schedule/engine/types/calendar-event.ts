export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  rotationId: string;
  assignees: string[];
  conflictFlags: string[];
  ruleViolations: string[];
}