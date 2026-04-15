import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserScopeService {
  constructor(private readonly prisma: PrismaService) { }

  async findByUser(userId: string) {
    const rows = await this.prisma.user_resource_scope.findMany({
      where: { user_id: userId },
    });

    return {
      group_ids: rows.filter(r => r.resource_type === 'GROUP').map(r => r.resource_id),
      team_ids: rows.filter(r => r.resource_type === 'TEAM').map(r => r.resource_id),
      subteam_ids: rows.filter(r => r.resource_type === 'SUBTEAM').map(r => r.resource_id),
      domain_ids: rows.filter(r => r.resource_type === 'DOMAIN').map(r => r.resource_id),
      rotation_ids: rows.filter(r => r.resource_type === 'ROTATION').map(r => r.resource_id),

      leave_approval_team_ids: rows
        .filter(r => r.resource_type === 'LEAVE_TEAM')
        .map(r => r.resource_id),

      leave_approval_group_ids: rows
        .filter(r => r.resource_type === 'LEAVE_GROUP')
        .map(r => r.resource_id),

      holiday_group_ids: rows
        .filter(r => r.resource_type === 'HOLIDAY_GROUP')
        .map(r => r.resource_id),

      holiday_global: rows.some(r => r.resource_type === 'HOLIDAY_GLOBAL'),
    };
  }

  addScope(userId: string, resourceType: string, resourceId: string | null = null) {
    return this.prisma.user_resource_scope.create({
      data: {
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId ?? '*', // holiday_global use '*'
      },
    });
  }

  removeScope(userId: string, resourceType: string, resourceId: string | null = null) {
    return this.prisma.user_resource_scope.deleteMany({
      where: {
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId ?? '*',
      },
    });
  }
}