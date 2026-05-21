import { http } from "../http";
import type {
  TeamRoleType,
  CreateTeamRoleTypeDto,
  UpdateTeamRoleTypeDto,
} from "../../types/org";

export const TeamRoleTypesAPI = {
  getAll(search?: string): Promise<TeamRoleType[]> {
    return http.get("/roles/team-types", {
      params: { search },
    }).then(res => res.data);
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

  checkCode(
    code: string,
    excludeId?: string
  ): Promise<{ exists: boolean }> {
    return http.get(`/roles/team-types/check-code`, {
      params: { code, excludeId },
    }).then(res => res.data);
  }
};