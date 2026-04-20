import { http } from "../http";
import type {
  RotationDefinition, RotationMember, AddMemberPayload,
  UpdateMemberPayload,
} from "../../types/rotation";


// =============================
// Rotation Definitions
// =============================

export const RotationAPI = {

  getAll: async (): Promise<RotationDefinition[]> => {
    const res = await http.get("/rotations");
    return res.data;
  },


  getOne: async (id: string): Promise<RotationDefinition> => {
    const res = await http.get(`/rotations/${id}`);
    return res.data;
  },


  create: async (data: any): Promise<RotationDefinition> => {
    const res = await http.post("/rotations", data);
    return res.data;
  },


  update: async (id: string, data: any): Promise<RotationDefinition> => {
    const res = await http.patch(`/rotations/${id}`, data);
    return res.data;
  },


  delete: async (id: string): Promise<void> => {
    await http.delete(`/rotations/${id}`);
  },

  // =============================
  // Rotation Members
  // =============================

  getMembers: async (rotationId: string): Promise<RotationMember[]> => {
    const res = await http.get(`/rotations/${rotationId}/members`);
    return res.data;
  },

  addMember: async (
    rotationId: string,
    data: AddMemberPayload
  ): Promise<RotationMember> => {
    const res = await http.post(`/rotations/${rotationId}/members`, {
      ...data,
      is_active: data.is_active,
    });
    return res.data;
  },

  removeMember: async (memberId: string): Promise<void> => {
    await http.delete(`/rotations/members/${memberId}`);
  },

  updateMember: async (
    memberId: string,
    data: UpdateMemberPayload
  ): Promise<RotationMember> => {
    const res = await http.patch(`/rotations/members/${memberId}`, data);
    return res.data;
  },

  reorderMembers: async (
    rotationId: string,
    items: { id: string; order_index: number }[]
  ): Promise<RotationMember[]> => {
    const res = await http.patch(`/rotations/${rotationId}/members/reorder`, {
      items,
    });
    return res.data;
  },

// =============================
// Schedule Generation
// =============================

  generateSchedule: async (rotationId: string) => {
    const res = await http.post(`/rotations/${rotationId}/schedule/generate`);
    return res.data;
  },

  getSchedule: async (rotationId: string) => {
    const res = await http.get(`/rotations/${rotationId}/schedule`);
    return res.data;
  },

};

