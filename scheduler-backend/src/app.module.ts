import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
  ],
})
export class AppModule {}
