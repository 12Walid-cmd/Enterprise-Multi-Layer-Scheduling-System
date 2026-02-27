import { http } from "../http";
import type{
  UserRole,
  AssignRoleToUserDto,
} from "../../types/org";

export const UserRolesAPI = {
  assign(data: AssignRoleToUserDto): Promise<UserRole> {
    return http.post("/roles/users", data).then(res => res.data);
  },

  remove(userId: string, roleTypeId: string): Promise<UserRole> {
    return http.delete(`/roles/users/${userId}/${roleTypeId}`).then(res => res.data);
  },

  getUserRoles(userId: string): Promise<UserRole[]> {
    return http.get(`/roles/users/${userId}`).then(res => res.data);
  },
};