import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { SCOPE_KEY } from '../decorators/scope.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PermissionService } from '../permissions.service';
import type { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';


@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const req: Request = context.switchToHttp().getRequest();

        // ----------------------------------------
        // 0. Public endpoint check
        // ----------------------------------------
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const user = req.user;
        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        // ----------------------------------------
        // 1. RBAC: check required permissions
        // ----------------------------------------
        const requiredPermissions =
            this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) || [];

        if (requiredPermissions.length > 0) {
            const hasPermission = this.permissionService.hasAnyPermission(
                req,
                requiredPermissions,
            );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Missing required permissions: ${requiredPermissions.join(', ')}`,
                );
            }
        }

        // ----------------------------------------
        // 2. PBAC: Scope check
        // ----------------------------------------
        const scopeMeta = this.reflector.getAllAndOverride<{
            type: string;
            idParam: string;
        }>(SCOPE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

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
