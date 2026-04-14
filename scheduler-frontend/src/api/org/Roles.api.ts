import { http } from "../http";
import type { Role } from "../../types/org";

export const RolesAPI = {
  getAll(): Promise<Role[]> {
    return http.get("/admin/roles").then(res => res.data);
  },

  getOne(roleId: string): Promise<Role> {
    return http.get(`/admin/roles/${roleId}`).then(res => res.data);
  },

  create(data: any): Promise<Role> {
    return http.post("/admin/roles", data).then(res => res.data);
  },

  update(roleId: string, data: any): Promise<Role> {
    return http.patch(`/admin/roles/${roleId}`, data).then(res => res.data);
  },

  delete(roleId: string): Promise<void> {
    return http.delete(`/admin/roles/${roleId}`).then(res => res.data);
  },

  assignPermission(roleId: string, permission: string): Promise<void> {
    return http.post(`/admin/roles/${roleId}/permissions`, { permission })
      .then(res => res.data);
  },

  removePermission(roleId: string, permission: string): Promise<void> {
    return http.delete(`/admin/roles/${roleId}/permissions/${encodeURIComponent(permission)}`)
      .then(res => res.data);
  },
};