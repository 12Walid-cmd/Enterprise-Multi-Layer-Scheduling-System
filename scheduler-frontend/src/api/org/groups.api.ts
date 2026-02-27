import { http } from "../http";
import type {
  Group,
  CreateGroupDto,
  UpdateGroupDto,
} from "../../types/org";

export const GroupsAPI = {
  getAll(): Promise<Group[]> {
    return http.get("/groups").then(res => res.data);
  },

  getOne(id: string): Promise<Group> {
    return http.get(`/groups/${id}`).then(res => res.data);
  },

  create(data: CreateGroupDto): Promise<Group> {
    return http.post("/groups", data).then(res => res.data);
  },

  update(id: string, data: UpdateGroupDto): Promise<Group> {
    return http.patch(`/groups/${id}`, data).then(res => res.data);
  },

  delete(id: string): Promise<Group> {
    return http.delete(`/groups/${id}`).then(res => res.data);
  },
};