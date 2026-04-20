import { http } from "../http";
import type { Holiday, CreateHolidayInput, UpdateHolidayInput } from "../../types/holiday";

export const HolidayAPI = {
  // -----------------------------
  // List all holidays (global)
  // -----------------------------
  getAll: async (): Promise<Holiday[]> => {
    const res = await http.get("/holidays");
    return res.data;
  },

  // -----------------------------
  // List holidays by group
  // -----------------------------
  getByGroup: async (groupId: string): Promise<Holiday[]> => {
    const res = await http.get(`/holidays/group/${groupId}`);
    return res.data;
  },

  // -----------------------------
  // Get one holiday (must include groupId)
  // -----------------------------
  getOne: async (id: string, groupId: string): Promise<Holiday> => {
    const res = await http.get(`/holidays/${id}/group/${groupId}`);
    return res.data;
  },

  // -----------------------------
  // Create holiday (must include groupId)
  // -----------------------------
  create: async (groupId: string, data: CreateHolidayInput): Promise<Holiday> => {
    const res = await http.post(`/holidays/group/${groupId}`, {
      ...data,
      date: new Date(data.date).toISOString(),
    });
    return res.data;
  },

  // -----------------------------
  // Update holiday (must include groupId)
  // -----------------------------
  update: async (id: string, groupId: string, data: UpdateHolidayInput): Promise<Holiday> => {
    const res = await http.patch(`/holidays/${id}/group/${groupId}`, data);
    return res.data;
  },

  // -----------------------------
  // Delete holiday (must include groupId)
  // -----------------------------
  remove: async (id: string, groupId: string): Promise<Holiday> => {
    const res = await http.delete(`/holidays/${id}/group/${groupId}`);
    return res.data;
  },
};
