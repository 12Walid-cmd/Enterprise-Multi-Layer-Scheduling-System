// src/api/DomainUsersAPI.ts
import { http } from "../http";
import type { DomainUser, AddUserToDomainDto } from "../../types/domain";

export const DomainUsersAPI = {
  
  getUsers(domainId: string): Promise<DomainUser[]> {
    return http
      .get(`/domains/${domainId}/users`)
      .then(res => res.data);
  },

 
  addUser(domainId: string, data: AddUserToDomainDto) {
    return http
      .post(`/domains/${domainId}/users`, data)
      .then(res => res.data);
  },

  
  removeUser(domainId: string, userId: string) {
    return http
      .delete(`/domains/${domainId}/users/${userId}`)
      .then(res => res.data);
  },
};