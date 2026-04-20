import { http } from "../http";
import type{ SubTeamMember, AddSubTeamMemberDto } from "../../types/org";

export const SubTeamMembersAPI = {
  get(subTeamId: string): Promise<SubTeamMember[]> {
    return http.get(`/teams/sub-teams/${subTeamId}/members`).then(res => res.data);
  },

  add(subTeamId: string, payload: AddSubTeamMemberDto): Promise<SubTeamMember> {
    return http.post(`/teams/sub-teams/${subTeamId}/members`, payload).then(res => res.data);
  },

  remove(subTeamId: string, userId: string): Promise<SubTeamMember> {
    return http.delete(`/teams/sub-teams/${subTeamId}/members/${userId}`).then(res => res.data);
  },
};