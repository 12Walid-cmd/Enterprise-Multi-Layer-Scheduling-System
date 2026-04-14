import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) { }

  findAll() {
    return this.prisma.rbac_roles.findMany({
      include: {
        role_permissions: {
          select: { permission: true }
        }
      }
    }).then(roles =>
      roles.map(r => ({
        ...r,
        permissions: r.role_permissions.map(rp => rp.permission)
      }))
    );
  }

  findOne(id: string) {
    return this.prisma.rbac_roles.findUnique({
      where: { id },
      include: {
        role_permissions: {
          select: { permission: true }
        }
      }
    }).then(role => {
      if (!role) return null;   

      return {
        ...role,
        permissions: role.role_permissions.map(rp => rp.permission)
      };
    });
  }

  create(dto: CreateRoleDto) {
    return this.prisma.rbac_roles.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  update(id: string, dto: CreateRoleDto) {
    return this.prisma.rbac_roles.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  delete(id: string) {
    return this.prisma.rbac_roles.delete({
      where: { id },
    });
  }

  addPermission(roleId: string, dto: AssignPermissionDto) {
    return this.prisma.role_permissions.create({
      data: {
        role_id: roleId,
        permission: dto.permission,
      },
    });
  }

  removePermission(roleId: string, permission: string) {
    return this.prisma.role_permissions.deleteMany({
      where: {
        role_id: roleId,
        permission,
      },
    });
  }
}