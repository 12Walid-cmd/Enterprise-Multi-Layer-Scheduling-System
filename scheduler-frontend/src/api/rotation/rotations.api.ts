import { http } from "../http";
import type { RotationDefinition, RotationMember, } from "../../types/rotation";

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
    data: { member_type: string; member_ref_id: string }
  ): Promise<RotationMember> => {
    const res = await http.post(`/rotations/${rotationId}/members`, data);
    return res.data;
  },

  removeMember: async (memberId: string): Promise<void> => {
    await http.delete(`/rotations/members/${memberId}`);
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
};