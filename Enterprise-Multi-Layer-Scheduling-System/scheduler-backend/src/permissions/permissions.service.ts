import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class PermissionService {
  // ----------------------------------------
  // RBAC: Check if user has a specific permission
  // ----------------------------------------
  hasPermission(req: Request, permission: string): boolean {
    const user = req.user;
    if (!user) return false;
    return user.permissions.includes(permission);
  }

  // ----------------------------------------
  // RBAC: Check if user has ANY of the permissions
  // ----------------------------------------
  hasAnyPermission(req: Request, permissions: string[]): boolean {
    const user = req.user;
    if (!user) return false;
    return permissions.some(p => user.permissions.includes(p));
  }

  // ----------------------------------------
  // RBAC: Check if user has ALL permissions
  // ----------------------------------------
  hasAllPermissions(req: Request, permissions: string[]): boolean {
    const user = req.user;
    if (!user) return false;
    return permissions.every(p => user.permissions.includes(p));
  }

  // ----------------------------------------
  // PBAC: Check resource scope
  // ----------------------------------------
  hasScope(
    req: Request,
    type: 'group' | 'domain' | 'team' | 'subteam' | 'rotation',
    id: string,
  ): boolean {
    const user = req.user!;
    if (!user) return false;

    switch (type) {
      case 'group':
        return user.scope.group_ids.includes(id);
      case 'domain':
        return user.scope.domain_ids.includes(id);
      case 'team':
        return user.scope.team_ids.includes(id);
      case 'subteam':
        return user.scope.subteam_ids.includes(id);
      case 'rotation':
        return user.scope.rotation_ids.includes(id);
      default:
        return false;
    }
  }



  // ----------------------------------------
  // RBAC + PBAC Combined Checks
  // ----------------------------------------
  canManageDomain(req: Request, domainId: string, permission: string): boolean {
    return (
      this.hasPermission(req, permission) &&
      this.hasScope(req, 'domain', domainId)
    );
  }

  canManageTeam(req: Request, teamId: string, permission: string): boolean {
    return (
      this.hasPermission(req, permission) &&
      this.hasScope(req, 'team', teamId)
    );
  }

  canManageGroup(req: Request, groupId: string, permission: string): boolean {
    return (
      this.hasPermission(req, permission) &&
      this.hasScope(req, 'group', groupId)
    );
  }

  canManageRotation(
    req: Request,
    rotationId: string,
    permission: string,
  ): boolean {
    return (
      this.hasPermission(req, permission) &&
      this.hasScope(req, 'rotation', rotationId)
    );
  }

  canApproveLeaveTeam(req: Request, teamId: string) {
    return req.user.scope.leave_approval_team_ids.includes(teamId);
  }

  canApproveLeaveGroup(req: Request, groupId: string) {
    return req.user.scope.leave_approval_group_ids.includes(groupId);
  }

  canManageHoliday(req: Request, groupId: string) {
    return (
      req.user.scope.holiday_global ||
      req.user.scope.holiday_group_ids.includes(groupId)
    );
  }


}