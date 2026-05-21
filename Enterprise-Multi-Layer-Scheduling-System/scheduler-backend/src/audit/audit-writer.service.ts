import { Injectable } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";

@Injectable()
export class AuditWriter {
    constructor(private readonly audit: AuditLogService) { }

    // ============================
    // Generic writer
    // ============================
    private write(
        event: string,
        userId: string,
        entityId: string,
        details?: any,
    ) {
        return this.audit.create({
            user_id: userId,
            action: event,
            entity_type: event.split('.')[0],
            entity_id: entityId,
            details,
        });
    }

    // ============================
    // Rotation
    // ============================
    rotation = {
        created: (userId: string, rotationId: string, data?: any) =>
            this.write('rotation.created', userId, rotationId, data),

        updated: (userId: string, rotationId: string, before: any, after: any) =>
            this.write('rotation.updated', userId, rotationId, { before, after }),

        deleted: (userId: string, rotationId: string) =>
            this.write('rotation.deleted', userId, rotationId),

        memberAdded: (userId: string, rotationId: string, data: any) =>
            this.write('rotation.member_added', userId, rotationId, data),

        memberRemoved: (userId: string, rotationId: string, data: any) =>
            this.write('rotation.member_removed', userId, rotationId, data),

        reordered: (userId: string, rotationId: string, data: any) =>
            this.write('rotation.members_reordered', userId, rotationId, data),
    };

    // ============================
    // Holiday
    // ============================
    holiday = {
        created: (userId: string, holidayId: string, data: any) =>
            this.write('holiday.created', userId, holidayId, data),

        updated: (userId: string, holidayId: string, before: any, after: any) =>
            this.write('holiday.updated', userId, holidayId, { before, after }),

        deleted: (userId: string, holidayId: string) =>
            this.write('holiday.deleted', userId, holidayId),
    };

    // ============================
    // Leave
    // ============================
    leave = {
        requested: (userId: string, leaveId: string, data: any) =>
            this.write('leave.requested', userId, leaveId, data),

        approved: (userId: string, leaveId: string) =>
            this.write('leave.approved', userId, leaveId),

        rejected: (userId: string, leaveId: string) =>
            this.write('leave.rejected', userId, leaveId),

        cancelled: (userId: string, leaveId: string) =>
            this.write('leave.cancelled', userId, leaveId),
    };

    // ============================
    // Schedule
    // ============================
    // schedule = {
    //     generated: (userId: string, rotationId: string, details?: any) =>
    //         this.write(userId, "SCHEDULE_GENERATED", "rotation", rotationId, details),

    //     overridden: (userId: string, resultId: string, details?: any) =>
    //         this.write(userId, "SCHEDULE_OVERRIDDEN", "schedule_result", resultId, details),
    // };

    // ============================
    // Team / Group / Domain
    // ============================
    team = {
        created: (userId: string, teamId: string, data: any) =>
            this.write('team.created', userId, teamId, data),

        updated: (userId: string, teamId: string, before: any, after: any) =>
            this.write('team.updated', userId, teamId, { before, after }),

        deleted: (userId: string, teamId: string) =>
            this.write('team.deleted', userId, teamId),
    };
    group = {
        created: (userId: string, groupId: string, data: any) =>
            this.write('group.created', userId, groupId, data),

        updated: (userId: string, groupId: string, before: any, after: any) =>
            this.write('group.updated', userId, groupId, { before, after }),

        deleted: (userId: string, groupId: string) =>
            this.write('group.deleted', userId, groupId),
    };

    domain = {
        created: (userId: string, domainId: string, data: any) =>
            this.write('domain.created', userId, domainId, data),

        updated: (userId: string, domainId: string, before: any, after: any) =>
            this.write('domain.updated', userId, domainId, { before, after }),

        deleted: (userId: string, domainId: string) =>
            this.write('domain.deleted', userId, domainId),
    };

    domainTeam = {
        created: (userId: string, id: string, data: any) =>
            this.write('domainTeam.created', userId, id, data),

        deleted: (userId: string, id: string) =>
            this.write('domainTeam.deleted', userId, id),

        memberAdded: (userId: string, domainTeamId: string, details: any) =>
            this.write('domainTeam.member_added', userId, domainTeamId, details),

        memberRemoved: (userId: string, domainTeamId: string, details: any) =>
            this.write('domainTeam.member_removed', userId, domainTeamId, details),
    };

    // ============================
    // Permission
    // ============================
    permission = {
        created: (userId: string, code: string, data?: any) =>
            this.write('permission.created', userId, code, data),

        deprecated: (userId: string, code: string, before: any, after: any) =>
            this.write('permission.deprecated', userId, code, { before, after }),
    };

}