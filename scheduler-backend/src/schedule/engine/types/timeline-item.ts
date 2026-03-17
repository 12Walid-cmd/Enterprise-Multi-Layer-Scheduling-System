export interface TimelineItem {
  userId: string;
  rotationId: string;
  start: string;
  end: string;
  conflictFlags: string[];
  ruleViolations: string[];
}