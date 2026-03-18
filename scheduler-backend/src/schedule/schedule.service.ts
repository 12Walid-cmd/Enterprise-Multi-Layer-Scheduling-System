// schedule.service.ts

import { Injectable } from '@nestjs/common';
import { RotationLoader } from './schedule.rotation-loader';
import { CalendarService } from './schedule.calendar.service';
import { ScheduleEngine } from './schedule.engine';
import { SchedulePersister } from './schedule.persister';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly rotationLoader: RotationLoader,
    private readonly calendar: CalendarService,
    private readonly engine: ScheduleEngine,
    private readonly persister: SchedulePersister,
  ) {}

  async generateForRotation(rotationId: string, generatedByUserId: string) {
    // 1. Load rotation definition
    const rotation = await this.rotationLoader.loadRotation(rotationId);

    // 2. Build A3 schedule context (holidays + leave + user-level holidays)
    const context = await this.calendar.buildContext(rotation);

    // 3. Determine schedule range
    const startDate = rotation.startDate;
    const endDate = rotation.endDate ?? new Date(startDate.getFullYear(), 11, 31);

    // 4. Generate schedule
    const assignments = await this.engine.generate(rotation, context, startDate, endDate);

    // 5. Persist results + audit + conflicts
    await this.persister.persist(rotation, assignments, []);

    return { count: assignments.length };
  }
}