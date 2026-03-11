import { http } from "../http";
import type{
  TeamMember,
  SubTeam,
  UpdateTeamDto,
  CreateSubTeam
} from "../../types/org";

export const SubTeamsAPI = {
  getAll(teamId: string): Promise<SubTeam[]> {
    return http.get(`/teams/${teamId}/sub-teams`).then(res => res.data);
  },

  create(teamId: string, payload: CreateSubTeam): Promise<SubTeam> {
    return http.post(`/teams/${teamId}/sub-teams`, payload).then(res => res.data);
  },

  getOne(subTeamId: string): Promise<SubTeam> {
    return http.get(`/teams/sub-teams/${subTeamId}`).then(res => res.data);
  },

  update(subTeamId: string, payload: UpdateTeamDto): Promise<SubTeam> {
    return http.put(`/teams/sub-teams/${subTeamId}`, payload).then(res => res.data);
  },

  getMembers(subTeamId: string): Promise<TeamMember[]> {
    return http.get(`/teams/sub-teams/${subTeamId}/members`).then(res => res.data);
  },

  addMember(subTeamId: string, payload: { userId: string }) {
  return http.post(`/teams/${subTeamId}/members`, payload).then(res => res.data);
},
};