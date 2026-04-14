import { http } from "../http";
import type { UserScope } from "../../types/user";

export const UserScopeAPI = {
  getScope(userId: string): Promise<UserScope> {
    return http.get(`/admin/users/${userId}/scope`).then(res => res.data);
  },

  addDomain(userId: string, domainId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/domain`, {
      resourceId: domainId,
    });
  },

  removeDomain(userId: string, domainId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/domain/${domainId}`);
  },

  addGroup(userId: string, groupId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/group`, {
      resourceId: groupId,
    });
  },

  removeGroup(userId: string, groupId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/group/${groupId}`);
  },

  addTeam(userId: string, teamId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/team`, {
      resourceId: teamId,
    });
  },

  removeTeam(userId: string, teamId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/team/${teamId}`);
  },

  addRotation(userId: string, rotationId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/rotation`, {
      resourceId: rotationId,
    });
  },

  removeRotation(userId: string, rotationId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/rotation/${rotationId}`);
  },
};