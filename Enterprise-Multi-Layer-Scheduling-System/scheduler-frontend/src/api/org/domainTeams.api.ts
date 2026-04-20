import { http } from "../http";
import type {
    DomainTeam,
    AddTeamToDomainDto,
    AddUserToDomainTeamDto,
    DomainTeamMember,
} from "../../types/domain";

export const DomainTeamsAPI = {
    getAll(): Promise<DomainTeam[]> {
        return http.get("/domain-teams").then(res => res.data);
    },

    getOne(id: string): Promise<DomainTeam> {
        return http.get(`/domain-teams/${id}`).then(res => res.data);
    },

    getTeamsByDomain(domainId: string): Promise<DomainTeam[]> {
        return http.get(`/domain-teams/domain/${domainId}/teams`).then(res => res.data);
    },

    getDomainsByTeam(teamId: string): Promise<DomainTeam[]> {
        return http.get(`/domain-teams/team/${teamId}/domains`).then(res => res.data);
    },



    create(data: AddTeamToDomainDto) {
        return http.post("/domain-teams", data).then(res => res.data);
    },

    delete(id: string) {
        return http.delete(`/domain-teams/${id}`).then(res => res.data);
    },

    addUser(domainTeamId: string, data: AddUserToDomainTeamDto) {
        return http.post(`/domain-teams/${domainTeamId}/members`, data).then(res => res.data);
    },

    removeUser(memberId: string) {
        return http.delete(`/domain-teams/members/${memberId}`).then(res => res.data);
    },

    getTeamMembers(domainTeamId: string): Promise<DomainTeamMember[]> {
        return http.get(`/domain-teams/${domainTeamId}/members`)
            .then(res => res.data);
    },

};