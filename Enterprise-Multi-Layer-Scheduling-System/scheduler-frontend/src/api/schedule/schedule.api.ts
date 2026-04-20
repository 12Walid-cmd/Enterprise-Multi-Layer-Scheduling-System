import { http } from '../http';


export async function getSchedule(rotationId: string) {
  const res = await http.get(`/rotations/${rotationId}/schedule`);
  return res.data;
  
}