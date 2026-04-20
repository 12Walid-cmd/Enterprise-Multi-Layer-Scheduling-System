import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';

import { PermissionGuard } from './permissions/guards/permission.guard';


import { OrgModule } from './org/org.module';
import { RotationsModule } from './rotations/rotations.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ConflictsModule } from './conflicts/conflicts.module';
import { LeaveModule } from './leave/leave.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RulesModule } from './rules/rules.module';
import { HolidayModule } from './holiday/holiday.module';
import { AuditModule } from './audit/audit.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionTypesModule } from './permission-types/permission-types.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    OrgModule,
    RotationsModule,
    ScheduleModule,
    ConflictsModule,
    LeaveModule,
    AuthModule,
    UsersModule,
    RulesModule,
    HolidayModule,
    AuditModule,
    PermissionsModule,
    PermissionTypesModule,
  ],
})
export class AppModule { }
