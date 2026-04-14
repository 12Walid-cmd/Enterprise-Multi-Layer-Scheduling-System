import { http } from "../http";
import type {
  Group,
  CreateGroupDto,
  UpdateGroupDto,
} from "../../types/org";

export const GroupsAPI = {
  // =========================
  // LIST (with search)
  // =========================
  getAll(search?: string): Promise<Group[]> {
    return http
      .get("/groups", {
        params: { search },
      })
      .then((res) => res.data);
  },

  // =========================
  // DETAIL
  // =========================
  getOne(id: string): Promise<Group> {
    return http.get(`/groups/${id}`).then((res) => res.data);
  },

  // =========================
  // CREATE
  // =========================
  create(data: CreateGroupDto): Promise<Group> {
    return http.post("/groups", data).then((res) => res.data);
  },

  // =========================
  // UPDATE
  // =========================
  update(id: string, data: UpdateGroupDto): Promise<Group> {
    return http.patch(`/groups/${id}`, data).then((res) => res.data);
  },

  // =========================
  // DELETE
  // =========================
  delete(id: string): Promise<Group> {
    return http.delete(`/groups/${id}`).then((res) => res.data);
  },
};