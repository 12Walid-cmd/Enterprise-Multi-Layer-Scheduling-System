import { http } from '../http';
import type { ScheduleResponse } from '../../types/schedule';

export async function getSchedule(
  rotationId: string,
  params?: { from?: string; to?: string }
): Promise<ScheduleResponse> {
  const search = new URLSearchParams(params || {}).toString();
  const url = `/schedule/${rotationId}${search ? `?${search}` : ''}`;

  const res = await http.get(url);
  return res.data;
}