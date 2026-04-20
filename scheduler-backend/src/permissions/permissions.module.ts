import { Module } from '@nestjs/common';
import { PermissionService } from './permissions.service';
import { PermissionGuard } from './guards/permission.guard';

import { PermissionSyncService } from './permission-sync.service';
import { PermissionSyncController } from './permission-sync.controller';
import { PermissionsController } from './permissions.controller';
import { AuditModule } from 'src/audit/audit.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuditModule,],
  controllers: [PermissionsController, PermissionSyncController],
  providers: [PermissionService, PermissionGuard, PermissionSyncService],
  exports: [PermissionService],
})
export class PermissionsModule {}