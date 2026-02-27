import { http } from "../http";
import type{
  Team,
  CreateTeamDto,
  UpdateTeamDto,
} from "../../types/org";

export const TeamsAPI = {
  getAll(): Promise<Team[]> {
    return http.get("/teams").then(res => res.data);
  },

  create(data: CreateTeamDto): Promise<Team> {
    return http.post("/teams", data).then(res => res.data);
  },

  update(id: string, data: UpdateTeamDto): Promise<Team> {
    return http.patch(`/teams/${id}`, data).then(res => res.data);
  },

  delete(id: string): Promise<Team> {
    return http.delete(`/teams/${id}`).then(res => res.data);
  },
};