// schedule.utils.ts
import { RotationCadence } from './schedule.types';

export function getCadenceDates(
  start: Date,
  end: Date,
  cadence: RotationCadence,
  interval: number,
): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));

    if (cadence === RotationCadence.DAILY) {
      current.setDate(current.getDate() + interval);
    } else if (cadence === RotationCadence.WEEKLY) {
      current.setDate(current.getDate() + 7 * interval);
    } else if (cadence === RotationCadence.BIWEEKLY) {
      current.setDate(current.getDate() + 14 * interval);
    } else {
      current.setDate(current.getDate() + interval);
    }
  }

  return dates;
}

export function expandWeightedMembers(members: { memberRefId: string; weight: number }[]): string[] {
  const expanded: string[] = [];
  for (const m of members) {
    const w = m.weight ?? 1;
    for (let i = 0; i < w; i++) {
      expanded.push(m.memberRefId);
    }
  }
  return expanded;
}

export function computeIndex(startDate: Date, currentDate: Date, length: number): number {
  if (length === 0) return 0;
  const diffDays = Math.floor(
    (stripTime(currentDate).getTime() - stripTime(startDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  return ((diffDays % length) + length) % length;
}

export function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}