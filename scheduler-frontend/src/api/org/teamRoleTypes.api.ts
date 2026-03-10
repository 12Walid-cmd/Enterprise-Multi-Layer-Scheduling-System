import { http } from "../http";
import type {
  TeamRoleType,
  CreateTeamRoleTypeDto,
  UpdateTeamRoleTypeDto,
} from "../../types/org";

export const TeamRoleTypesAPI = {
  getAll(): Promise<TeamRoleType[]> {
    return http.get("/roles/team-types").then(res => res.data);
  },

  getOne(id: string): Promise<TeamRoleType> {
    return http.get(`/roles/team-types/${id}`).then(res => res.data);
  },

  create(data: CreateTeamRoleTypeDto): Promise<TeamRoleType> {
    return http.post("/roles/team-types", data).then(res => res.data);
  },

  update(id: string, data: UpdateTeamRoleTypeDto): Promise<TeamRoleType> {
    return http.patch(`/roles/team-types/${id}`, data).then(res => res.data);
  },

  delete(id: string): Promise<void> {
    return http.delete(`/roles/team-types/${id}`).then(res => res.data);
  },
};