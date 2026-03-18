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
      assignee_ref_id: a.assigneeRefId,
      assignees: [a.assigneeRefId],   // ← 必填欄位
      created_at: new Date(),
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
    await this.prisma.audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        rotation_id: rotation.id,
        snapshot: {
          rotation,
          assignments,
          conflicts,
        },
        created_at: new Date(),
      },
    });
  }

  /**
   * Write conflict logs.
   */
  private async writeConflictLogs(rotation: LoadedRotation, conflicts: any[]) {
    const rows = conflicts.map((c) => ({
      id: crypto.randomUUID(),
      rotation_id: rotation.id,
      date: c.date,
      user_id: c.userId,
      conflict_type: c.type,
      details: c.details,
      created_at: new Date(),
    }));

    await this.prisma.schedule_conflicts.createMany({
      data: rows,
    });
  }
}