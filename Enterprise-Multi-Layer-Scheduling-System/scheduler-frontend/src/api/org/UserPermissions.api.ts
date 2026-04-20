import { http } from "../http";

export const UserPermissionsAPI = {
  getByUser(userId: string): Promise<{ user_id: string; permission: string }[]> {
    return http.get(`/admin/users/${userId}/permissions`)
      .then(res => res.data);
  },

  assign(userId: string, permission: string): Promise<void> {
    return http.post(`/admin/users/${userId}/permissions`, { permission })
      .then(res => res.data);
  },

  remove(userId: string, permission: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/permissions/${permission}`)
      .then(res => res.data);
  },
};