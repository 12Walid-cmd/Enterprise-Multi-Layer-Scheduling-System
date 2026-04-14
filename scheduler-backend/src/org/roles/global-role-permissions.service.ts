import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GlobalRolePermissionsService {
  constructor(private prisma: PrismaService) {}

  findByRole(roleId: string) {
    return this.prisma.global_role_permissions.findMany({
      where: { role_id: roleId },
      orderBy: { permission: 'asc' },
    });
  }

  addPermission(roleId: string, permission: string) {
    return this.prisma.global_role_permissions.create({
      data: { role_id: roleId, permission },
    });
  }

  removePermission(roleId: string, permission: string) {
    return this.prisma.global_role_permissions.delete({
      where: { role_id_permission: { role_id: roleId, permission } },
    });
  }
}