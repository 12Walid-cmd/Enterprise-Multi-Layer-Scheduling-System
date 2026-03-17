import { Injectable } from '@nestjs/common';
import { ConflictCheckedDay } from '../engine/conflict-checker';

export interface TimelineItem {
  userId: string;
  rotationId: string;
  start: string; // ISO
  end: string;   // ISO
  conflictFlags: string[];
  ruleViolations: string[];
}

@Injectable()
export class TimelineBuilder {

  build(days: ConflictCheckedDay[]): TimelineItem[] {
    const items: TimelineItem[] = [];

    
    const sorted = [...days].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    
    const activeMap = new Map<
      string,
      {
        rotationId: string;
        start: Date;
        end: Date;
        conflictFlags: string[];
        ruleViolations: string[];
      }
    >();

    for (const day of sorted) {
      for (const userId of day.assignees) {
        const key = `${userId}-${day.rotationId}`;
        const active = activeMap.get(key);

        if (!active) {
        
          activeMap.set(key, {
            rotationId: day.rotationId,
            start: day.date,
            end: day.date,
            conflictFlags: [...day.conflictFlags],
            ruleViolations: [...day.ruleViolations],
          });
          continue;
        }

      
        const diff =
          (day.date.getTime() - active.end.getTime()) / 86400000;

        if (diff === 1) {
          
          active.end = day.date;
          active.conflictFlags.push(...day.conflictFlags);
          active.ruleViolations.push(...day.ruleViolations);
        } else {
          
          items.push({
            userId,
            rotationId: active.rotationId,
            start: this.toISOStart(active.start),
            end: this.toISOEnd(active.end),
            conflictFlags: active.conflictFlags,
            ruleViolations: active.ruleViolations,
          });

          activeMap.set(key, {
            rotationId: day.rotationId,
            start: day.date,
            end: day.date,
            conflictFlags: [...day.conflictFlags],
            ruleViolations: [...day.ruleViolations],
          });
        }
      }
    }

   
    for (const [key, active] of activeMap.entries()) {
      const [userId] = key.split('-');

      items.push({
        userId,
        rotationId: active.rotationId,
        start: this.toISOStart(active.start),
        end: this.toISOEnd(active.end),
        conflictFlags: active.conflictFlags,
        ruleViolations: active.ruleViolations,
      });
    }

    return items;
  }

  private toISOStart(date: Date): string {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
    ).toISOString();
  }

  private toISOEnd(date: Date): string {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0),
    ).toISOString();
  }
}