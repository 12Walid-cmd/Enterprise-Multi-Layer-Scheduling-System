import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { SCOPE_KEY } from '../decorators/scope.decorator';
import { PermissionService } from '../permission.service';
import type { Request } from 'express';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const req: Request = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // ----------------------------------------
        // 1. RBAC: Read required permissions
        // ----------------------------------------
        const requiredPermissions =
            this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler()) || [];

        if (requiredPermissions.length > 0) {
            const hasPermission = this.permissionService.hasAnyPermission(
                req,
                requiredPermissions,
            );

            if (!hasPermission) {
                throw new ForbiddenException('Missing required permissions');
            }
        }

        // ----------------------------------------
        // 2. PBAC: Read required scope
        // ----------------------------------------
        const scopeMeta =
            this.reflector.get<{ type: string; idParam: string }>(
                SCOPE_KEY,
                context.getHandler(),
            );

        if (scopeMeta) {
            const { type, idParam } = scopeMeta;

            const raw = req.params[idParam];
            const resourceId = Array.isArray(raw) ? raw[0] : raw;

            if (!resourceId) {
                throw new ForbiddenException(`Missing resource identifier: ${idParam}`);
            }
            const hasScope = this.permissionService.hasScope(
                req,
                type as any,
                resourceId,
            );

            if (!hasScope) {
                throw new ForbiddenException(
                    `No ${type} scope for resource ${resourceId}`,
                );
            }
        }

        return true;
    }
}