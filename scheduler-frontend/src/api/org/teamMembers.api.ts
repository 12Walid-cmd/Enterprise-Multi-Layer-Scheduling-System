import { http } from "../http";
import type{
  TeamMember,
  AddTeamMemberDto,
} from "../../types/org";

export const TeamMembersAPI = {
  add(teamId: string, data: AddTeamMemberDto): Promise<TeamMember> {
    return http.post(`/teams/${teamId}/members`, data).then(res => res.data);
  },

  remove(teamId: string, userId: string): Promise<TeamMember> {
    return http.delete(`/teams/${teamId}/members/${userId}`).then(res => res.data);
  },
};