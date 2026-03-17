import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';

import { RotationsService } from '../../rotations/rotations.service';


export enum RotationCadence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  CUSTOM = 'CUSTOM',
}

interface CadenceContext {
  rotationId: string;
  from: Date;
  to: Date;
}

@Injectable()
export class CadenceCalculator {
  constructor(
    private readonly rotationsService: RotationsService, 
  ) {}

  async generate(rotationId: string, from: Date, to: Date): Promise<Date[]> {
    if (to < from) {
      throw new Error('Invalid date range: "to" must be >= "from"');
    }

    const rotation = await this.rotationsService.getOne(rotationId);
    if (!rotation) {
      throw new Error(`Rotation not found: ${rotationId}`);
    }

    const cadence = rotation.cadence as RotationCadence;
    const interval = rotation.cadence_interval ?? 1;


    const startDate: Date = rotation.start_date
      ? new Date(rotation.start_date)
      : from;

    const ctx: CadenceContext = { rotationId, from, to };

    switch (cadence) {
      case RotationCadence.DAILY:
        return this.generateDaily(ctx, startDate, 1);

      case RotationCadence.WEEKLY:
        return this.generateDaily(ctx, startDate, 7);

      case RotationCadence.BIWEEKLY:
        return this.generateDaily(ctx, startDate, 14);

      case RotationCadence.CUSTOM:
        return this.generateDaily(ctx, startDate, interval || 1);

      default:
        throw new Error(`Unsupported cadence: ${cadence}`);
    }
  }


  private generateDaily(
    ctx: CadenceContext,
    startDate: Date,
    stepDays: number,
  ): Date[] {
    const { from, to } = ctx;

    const result: Date[] = [];

    let current = this.alignToFrom(startDate, from, stepDays);

    while (current <= to) {
      result.push(current);
      current = addDays(current, stepDays);
    }

    return result;
  }


  private alignToFrom(
    startDate: Date,
    from: Date,
    stepDays: number,
  ): Date {
    if (startDate >= from) {
      return startDate;
    }

    const diffMs = from.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    const steps = Math.ceil(diffDays / stepDays);
    return addDays(startDate, steps * stepDays);
  }
}