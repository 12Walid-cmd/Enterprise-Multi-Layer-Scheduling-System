import { http } from "../http";
import type { Holiday, CreateHolidayInput, UpdateHolidayInput } from "../../types/holiday";

export const HolidayAPI = {
  getAll: async (): Promise<Holiday[]> => {
    const res = await http.get("/holidays");
    return res.data;
  },

  getByGroup: async (groupId: string): Promise<Holiday[]> => {
    const res = await http.get(`/holidays/group/${groupId}`);
    return res.data;
  },

  getOne: async (id: string): Promise<Holiday> => {
    const res = await http.get(`/holidays/${id}`);
    return res.data;
  },

  create: async (data: CreateHolidayInput): Promise<Holiday> => {
    const res = await http.post("/holidays", data);
    return res.data;
  },

  update: async (id: string, data: UpdateHolidayInput): Promise<Holiday> => {
    const res = await http.patch(`/holidays/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<Holiday> => {
    const res = await http.delete(`/holidays/${id}`);
    return res.data;
  },
};