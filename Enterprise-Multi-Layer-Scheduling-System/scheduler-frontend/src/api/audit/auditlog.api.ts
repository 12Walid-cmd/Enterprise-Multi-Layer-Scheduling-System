// src/api/AuditLogAPI.ts
import { http } from "../http";
import type { AuditLog } from "../../types/auditlog";



export const AuditLogAPI = {
    getAll: async (): Promise<AuditLog[]> => {
        const res = await http.get("/audit-logs");
        return res.data;
    },
    getByEntity: async (entity_type: string, entity_id: string): Promise<AuditLog[]> => {
        const res = await http.get(`/audit-logs/${entity_type}/${entity_id}`);
        return res.data;
    },

    getByAction: async (action: string): Promise<AuditLog[]> => {
        const res = await http.get(`/audit-logs/action/${action}`);
        return res.data;
    },
    
    filter: async (params: {
        entity_type?: string;
        entity_id?: string;
        action?: string;
    }): Promise<AuditLog[]> => {
        const res = await http.get("/audit-logs/filter", { params });
        return res.data;
    },
};