export interface AuditLog {
    id: string;
    user_id?: string | null;
    action: string;
    entity_type: string;
    entity_id: string;
    timestamp: string;
    details?: any;
}