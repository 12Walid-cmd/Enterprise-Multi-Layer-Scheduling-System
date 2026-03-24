// schedule.persister.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DailyAssignment, LoadedRotation } from './schedule.types';

@Injectable()
export class SchedulePersister {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Persist schedule results into DB.
   * - schedule_results table
   * - audit snapshot
   * - conflict logs (optional)
   */
  async persist(
    rotation: LoadedRotation,
    assignments: DailyAssignment[],
    conflicts: any[] = [],
  ) {
    // 1. Write schedule results
    await this.writeScheduleResults(rotation, assignments);

    // 2. Write audit snapshot
    await this.writeAuditSnapshot(rotation, assignments, conflicts);

    // 3. Write conflict logs (optional)
    if (conflicts.length > 0) {
      await this.writeConflictLogs(rotation, conflicts);
    }
  }

  /**
   * Write schedule_results rows.
   */
  private async writeScheduleResults(
    rotation: LoadedRotation,
    assignments: DailyAssignment[],
  ) {
    const rows = assignments.map((a) => ({
      id: crypto.randomUUID(),
      rotation_id: rotation.id,
      date: a.date,
      tier_level: a.tierLevel,
      assignees: [a.assigneeRefId],
      conflicts: [],                  
      generated_by: null,            
      override_flag: false,
    }));

    await this.prisma.schedule_results.createMany({
      data: rows,
    });
  }

  /**
   * Write audit snapshot.
   * Stores:
   * - rotation definition
   * - assignments
   * - conflicts
   */
  private async writeAuditSnapshot(
    rotation: LoadedRotation,
    assignments: DailyAssignment[],
    conflicts: any[],
  ) {
    await this.prisma.rotation_audit_snapshots.create({
      data: {
        id: crypto.randomUUID(),
        rotation_id: rotation.id,
        snapshot_data: {
          rotation: this.toJsonSafe(rotation),
          assignments: assignments.map(a => this.toJsonSafe(a)),
          conflicts: conflicts.map(c => this.toJsonSafe(c)),
        },
      },
    });
  }

  private toJsonSafe(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Write conflict logs.
   */
  private async writeConflictLogs(rotation: LoadedRotation, conflicts: any[]) {
    const byDate = new Map<string, any[]>();

    for (const c of conflicts) {
      const key = c.date.toISOString();
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(this.toJsonSafe(c));
    }

    for (const [date, conflictList] of byDate.entries()) {
      await this.prisma.schedule_results.updateMany({
        where: {
          rotation_id: rotation.id,
          date: new Date(date),
        },
        data: {
          conflicts: conflictList,
        },
      });
    }
  }
}