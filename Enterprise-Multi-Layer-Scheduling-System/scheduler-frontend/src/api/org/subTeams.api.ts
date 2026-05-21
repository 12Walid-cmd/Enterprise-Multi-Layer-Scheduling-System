import { http } from "../http";
import type {
  SubTeam,
  CreateSubTeam,
  UpdateSubTeamDto,
  Team,
} from "../../types/org";

export const SubTeamsAPI = {
  // =========================
  // 1. subteams（ search）
  // GET /sub-teams?search=xxx
  // =========================
  getAll(search?: string): Promise<SubTeam[]> {
    return http
      .get("/sub-teams", {
        params: search ? { search } : {},
      })
      .then((res) => res.data);
  },

  // =========================
  // 2.  subteam
  // GET /sub-teams/:id
  // =========================
  getOne(subTeamId: string): Promise<SubTeam> {
    return http
      .get(`/sub-teams/${subTeamId}`)
      .then((res) => res.data);
  },

  // =========================
  // 3.  subteam
  // POST /sub-teams
  // body: { name, description, timezone, parent_team_id, lead_user_id }
  // =========================
  create(payload: CreateSubTeam): Promise<SubTeam> {
    return http
      .post("/sub-teams", payload)
      .then((res) => res.data);
  },

  // =========================
  // 4. subteam
  // PUT /sub-teams/:id
  // =========================
  update(
    subTeamId: string,
    payload: UpdateSubTeamDto
  ): Promise<SubTeam> {
    return http
      .put(`/sub-teams/${subTeamId}`, payload)
      .then((res) => res.data);
  },

  // =========================
  // 5.  subteam
  // DELETE /sub-teams/:id
  // =========================
  delete(subTeamId: string): Promise<void> {
    return http
      .delete(`/sub-teams/${subTeamId}`)
      .then((res) => res.data);
  },

  // =========================
  // 6. parent teams（root teams）
  // GET /sub-teams/parent-teams
  // =========================
  getParentTeams(): Promise<Team[]> {
    return http
      .get("/sub-teams/parent-teams")
      .then((res) => res.data);
  },
};