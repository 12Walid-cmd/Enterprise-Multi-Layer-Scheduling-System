import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAuditLogDto } from "./dto/audit-log.dto";

@Injectable()
export class AuditLogService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateAuditLogDto) {
        return this.prisma.audit_logs.create({
            data: {
                user_id: dto.user_id,
                action: dto.action,
                entity_type: dto.entity_type,
                entity_id: dto.entity_id,
                details: dto.details,
            },
        });
    }

    async findByEntity(entity_type: string, entity_id: string) {
        return this.prisma.audit_logs.findMany({
            where: { entity_type, entity_id },
            orderBy: { timestamp: "desc" },
        });
    }

    async findByAction(action: string) {
        return this.prisma.audit_logs.findMany({
            where: {
                action: {
                    endsWith: action, // "group.created" → endsWith "created"
                },
            },
            orderBy: { timestamp: "desc" },
        });
    }

    async findAll() {
        return this.prisma.audit_logs.findMany({
            orderBy: { timestamp: "desc" },
            take: 200,
        });
    }

    async filter(query: any) {
        return this.prisma.audit_logs.findMany({
            where: {
                entity_type: query.entity_type || undefined,
                entity_id: query.entity_id || undefined,
                action: query.action
                    ? { endsWith: query.action }
                    : undefined,
            },
            orderBy: { timestamp: "desc" },
        });
    }
}