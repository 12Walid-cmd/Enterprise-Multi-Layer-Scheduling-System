import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignUserGlobalRoleDto } from './dto/assign-user-global-role.dto';

@Injectable()
export class UserRolesService {
  constructor(private readonly prisma: PrismaService) {}

  assign(dto: AssignUserGlobalRoleDto) {
    return this.prisma.user_roles.create({
      data: {
        user_id: dto.userId,
        global_role_id: dto.globalRoleId,
      },
    });
  }

  remove(userId: string, globalRoleId: string) {
    return this.prisma.user_roles.delete({
      where: {
        user_id_global_role_id: {
          user_id: userId,
          global_role_id: globalRoleId,
        },
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.user_roles.findMany({
      where: { user_id: userId },
      include: { global_roles: true },
    });
  }
}