import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    const rows = await this.prisma.user_resource_scope.findMany({
      where: { user_id: userId },
    });

    return {
      group_ids: rows.filter(r => r.resource_type === 'GROUP').map(r => r.resource_id),
      domain_ids: rows.filter(r => r.resource_type === 'DOMAIN').map(r => r.resource_id),
      team_ids: rows.filter(r => r.resource_type === 'TEAM').map(r => r.resource_id),
      rotation_ids: rows.filter(r => r.resource_type === 'ROTATION').map(r => r.resource_id),
    };
  }

  addScope(userId: string, resourceType: string, resourceId: string) {
    return this.prisma.user_resource_scope.create({
      data: {
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
      },
    });
  }

  removeScope(userId: string, resourceType: string, resourceId: string) {
    return this.prisma.user_resource_scope.deleteMany({
      where: {
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
      },
    });
  }
}