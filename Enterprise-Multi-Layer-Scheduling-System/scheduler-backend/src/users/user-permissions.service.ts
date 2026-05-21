import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignUserPermissionDto } from './dto/assign-user-permission.dto';

@Injectable()
export class UserPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string) {
    return this.prisma.user_permissions.findMany({
      where: { user_id: userId },
    });
  }

  assign(dto: AssignUserPermissionDto) {
    return this.prisma.user_permissions.create({
      data: {
        user_id: dto.userId,
        permission: dto.permission,
      },
    });
  }

  remove(userId: string, permission: string) {
    return this.prisma.user_permissions.delete({
      where: {
        user_id_permission: {
          user_id: userId,
          permission,
        },
      },
    });
  }
}