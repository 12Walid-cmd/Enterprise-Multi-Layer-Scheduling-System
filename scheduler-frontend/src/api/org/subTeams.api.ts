import { http } from "../http";

export interface SubTeam {
  id: string;
  name: string;
  description?: string | null;
  timezone?: string | null;
  parent_team_id: string | null;
}

export interface CreateSubTeamPayload {
  name: string;
  description?: string;
  timezone?: string;
}

export interface Member {
  user_id: string;
  users: {
    id: string;
    name: string;
    email: string;
  };
}

export const getSubTeams = async (teamId: string): Promise<SubTeam[]> => {
  const res = await http.get(`/teams/${teamId}/sub-teams`);
  return res.data;
};

export const createSubTeam = async (
  teamId: string,
  payload: CreateSubTeamPayload,
): Promise<SubTeam> => {
  const res = await http.post(`/teams/${teamId}/sub-teams`, payload);
  return res.data;
};

export const getSubTeam = async (subTeamId: string): Promise<SubTeam> => {
  const res = await http.get(`/teams/sub-teams/${subTeamId}`);
  return res.data;
};

export const updateSubTeam = async (
  subTeamId: string,
  payload: CreateSubTeamPayload,
): Promise<SubTeam> => {
  const res = await http.put(`/teams/sub-teams/${subTeamId}`, payload);
  return res.data;
};

export const getSubTeamMembers = async (
  subTeamId: string,
): Promise<Member[]> => {
  const res = await http.get(`/teams/sub-teams/${subTeamId}/members`);
  return res.data;
};

export const addSubTeamMember = async (
  subTeamId: string,
  userId: string,
) => {
  const res = await http.post(`/teams/${subTeamId}/members`, {
    userId,
  });
  return res.data;
};