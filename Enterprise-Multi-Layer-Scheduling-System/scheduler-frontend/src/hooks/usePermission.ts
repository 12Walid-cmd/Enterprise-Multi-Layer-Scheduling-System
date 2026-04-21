import { useAuth } from '../context/AuthContext';

export function usePermission() {
  const { user } = useAuth();

  if (!user) {
    return {
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      hasScope: () => false,
      canManageDomain: () => false,
      canManageTeam: () => false,
      canManageGroup: () => false,
      canManageRotation: () => false,
    };
  }

  // -----------------------------
  // RBAC: Check single permission
  // -----------------------------
  const hasPermission = (permission: string) => {
    return user.permissions.includes(permission);
  };

  // -----------------------------
  // RBAC: Check ANY permission
  // -----------------------------
  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(p => user.permissions.includes(p));
  };

  // -----------------------------
  // RBAC: Check ALL permissions
  // -----------------------------
  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every(p => user.permissions.includes(p));
  };

  // -----------------------------
  // PBAC: Check resource scope
  // -----------------------------
  const hasScope = (
    type: 'group' | 'domain' | 'team' | 'rotation',
    id: string,
  ) => {
    if (!user.scope) return false;

    switch (type) {
      case 'group':
        return user.scope.group_ids.includes(id);
      case 'domain':
        return user.scope.domain_ids.includes(id);
      case 'team':
        return user.scope.team_ids.includes(id);
      case 'rotation':
        return user.scope.rotation_ids.includes(id);
      default:
        return false;
    }
  };

  // -----------------------------
  // Combined RBAC + PBAC
  // -----------------------------
  const canManageDomain = (domainId: string, permission: string) =>
    hasPermission(permission) && hasScope('domain', domainId);

  const canManageTeam = (teamId: string, permission: string) =>
    hasPermission(permission) && hasScope('team', teamId);

  const canManageGroup = (groupId: string, permission: string) =>
    hasPermission(permission) && hasScope('group', groupId);

  const canManageRotation = (rotationId: string, permission: string) =>
    hasPermission(permission) && hasScope('rotation', rotationId);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasScope,
    canManageDomain,
    canManageTeam,
    canManageGroup,
    canManageRotation,
  };
}