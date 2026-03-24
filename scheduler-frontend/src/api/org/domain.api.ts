import { http } from "../http";
import type {
    Domain,
    CreateDomainDto,
    UpdateDomainDto,
    DomainUser,
} from "../../types/domain";

export const DomainAPI = {
    getAll(): Promise<Domain[]> {
        return http.get("/domains").then(res => res.data);
    },

    getOne(id: string): Promise<Domain> {
        return http.get(`/domains/${id}`).then(res => res.data);
    },

    create(data: CreateDomainDto): Promise<Domain> {
        return http.post("/domains", data).then(res => res.data);
    },

    update(id: string, data: UpdateDomainDto): Promise<Domain> {
        return http.patch(`/domains/${id}`, data).then(res => res.data);
    },

    delete(id: string): Promise<void> {
        return http.delete(`/domains/${id}`).then(res => res.data);
    },

    addUser(domainId: string, data: { user_id: string }) {
        return http.post(`/domains/${domainId}/users`, data).then(res => res.data);
    },

    removeUser(domainId: string, userId: string) {
        return http.delete(`/domains/${domainId}/users/${userId}`).then(res => res.data);
    },

    getDomainUsers(domainId: string): Promise<DomainUser[]> {
        return http.get(`/domains/${domainId}/users`).then(res => res.data);
    },

};