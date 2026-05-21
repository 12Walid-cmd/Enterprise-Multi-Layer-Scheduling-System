import { http } from "../http";

export const GlobalRolePermissionsAPI = {
  get(roleId: string) {
    return http.get(`/admin/global-roles/${roleId}/permissions`)
      .then(res => res.data);
  },

  add(roleId: string, permission: string) {
    return http.post(`/admin/global-roles/${roleId}/permissions`, { permission })
      .then(res => res.data);
  },

  remove(roleId: string, permission: string) {
    return http.delete(`/admin/global-roles/${roleId}/permissions/${permission}`)
      .then(res => res.data);
  }
};