import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}

  assign(data) {
    return this.prisma.user_roles.create({ data });
  }

  remove(user_id: string, role_type_id: string) {
    return this.prisma.user_roles.delete({
      where: {
        user_id_role_type_id: {
          user_id,
          role_type_id,
        },
      },
    });
  }

  findByUser(user_id: string) {
    return this.prisma.user_roles.findMany({
      where: { user_id },
      include: { role_types: true },
    });
  }
}