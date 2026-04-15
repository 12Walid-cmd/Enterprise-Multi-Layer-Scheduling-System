import type { User } from "../../types/user";
import { http } from "../http";


export const UsersAPI = {
  getAll(search?: string): Promise<User[]> {
    return http.get("/users", {
      params: { search },
    }).then(res =>
      res.data.map((u: any) => ({
        ...u,
        permissions: u.userPermissions?.map((p: any) => p.permission) || [],
        permissionMeta: u.userPermissions?.map((p: any) => ({
          code: p.permission,
          name: p.permission_types?.name || p.permission,
          description: p.permission_types?.description || "",
        })) || []
      }))
    );
  },

  getOne(id: string | number) {
    return http.get(`/users/${id}`).then(res => res.data);
  },

  create(data: any) {
    return http.post("/users", data).then(res => res.data);
  },

  update(id: string | number, data: any) {
    return http.patch(`/users/${id}`, data).then(res => res.data);
  },

  delete(id: string | number) {
    return http.delete(`/users/${id}`).then(res => res.data);
  },
};