import { http } from "../http";


export const UsersAPI = {
  getAll(search?: string) {
    return http.get("/users", {
      params: { search },
    }).then(res => res.data);
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