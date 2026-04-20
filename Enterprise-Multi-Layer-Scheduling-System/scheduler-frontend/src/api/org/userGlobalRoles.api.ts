import { http } from "../http";
import type {
  UserGlobalRole,
  AssignUserGlobalRoleDto,
} from "../../types/org";

export const UserGlobalRolesAPI = {
  assign(data: AssignUserGlobalRoleDto): Promise<UserGlobalRole> {
    return http.post("/roles/users", data).then(res => res.data);
  },

  getByUser(userId: string): Promise<UserGlobalRole[]> {
    return http.get(`/roles/users/${userId}`).then(res => res.data);
  },

  remove(userId: string, globalRoleId: string): Promise<void> {
    return http
      .delete(`/roles/users/${userId}/${globalRoleId}`)
      .then(res => res.data);
  },
};