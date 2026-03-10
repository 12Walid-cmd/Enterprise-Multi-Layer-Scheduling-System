import { http } from "../http";


export const getUsers = (search?: string) => {
  return http.get("/users", {
    params: { search },
  });
};


export const getUser = (id: string | number) => {
  return http.get(`/users/${id}`);
};


export const createUser = (data: any) => {
  return http.post("/users", data);
};


export const updateUser = (id: string | number, data: any) => {
  return http.patch(`/users/${id}`, data);
};


export const deleteUser = (id: string | number) => {
  return http.delete(`/users/${id}`);
};