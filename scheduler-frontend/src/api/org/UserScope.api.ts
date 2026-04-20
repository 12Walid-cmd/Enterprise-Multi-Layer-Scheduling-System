import { http } from "../http";
import type { UserScope } from "../../types/user";

export const UserScopeAPI = {
  getScope(userId: string): Promise<UserScope> {
    return http.get(`/admin/users/${userId}/scope`).then(res => res.data);
  },

  // -------------------------
  // GROUP
  // -------------------------
  addGroup(userId: string, groupId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/group`, {
      resourceId: groupId,
    });
  },

  removeGroup(userId: string, groupId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/group/${groupId}`);
  },

  // -------------------------
  // TEAM
  // -------------------------
  addTeam(userId: string, teamId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/team`, {
      resourceId: teamId,
    });
  },

  removeTeam(userId: string, teamId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/team/${teamId}`);
  },

  // -------------------------
  // SUBTEAM
  // -------------------------
  addSubteam(userId: string, subteamId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/subteam`, {
      resourceId: subteamId,
    });
  },

  removeSubteam(userId: string, subteamId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/subteam/${subteamId}`);
  },

  // -------------------------
  // DOMAIN
  // -------------------------
  addDomain(userId: string, domainId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/domain`, {
      resourceId: domainId,
    });
  },

  removeDomain(userId: string, domainId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/domain/${domainId}`);
  },

  // -------------------------
  // ROTATION
  // -------------------------
  addRotation(userId: string, rotationId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/rotation`, {
      resourceId: rotationId,
    });
  },

  removeRotation(userId: string, rotationId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/rotation/${rotationId}`);
  },

  // -------------------------
  // LEAVE APPROVAL (TEAM)
  // -------------------------
  addLeaveTeam(userId: string, teamId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/leave-team`, {
      resourceId: teamId,
    });
  },

  removeLeaveTeam(userId: string, teamId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/leave-team/${teamId}`);
  },

  // -------------------------
  // LEAVE APPROVAL (GROUP)
  // -------------------------
  addLeaveGroup(userId: string, groupId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/leave-group`, {
      resourceId: groupId,
    });
  },

  removeLeaveGroup(userId: string, groupId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/leave-group/${groupId}`);
  },

  // -------------------------
  // HOLIDAY GROUP
  // -------------------------
  addHolidayGroup(userId: string, groupId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/holiday-group`, {
      resourceId: groupId,
    });
  },

  removeHolidayGroup(userId: string, groupId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/holiday-group/${groupId}`);
  },

  // -------------------------
  // HOLIDAY GLOBAL
  // -------------------------
  addHolidayGlobal(userId: string): Promise<void> {
    return http.post(`/admin/users/${userId}/scope/holiday-global`);
  },

  removeHolidayGlobal(userId: string): Promise<void> {
    return http.delete(`/admin/users/${userId}/scope/holiday-global`);
  },
};