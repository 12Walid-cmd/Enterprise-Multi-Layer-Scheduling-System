import { Module } from '@nestjs/common';
import { OrgModule } from './modules/org/org.module';
import { RotationsModule } from './modules/rotations/rotations.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ConflictsModule } from './modules/conflicts/conflicts.module';
import { LeaveModule } from './modules/leave/leave.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';




@Module({
  imports: [PrismaModule, OrgModule, RotationsModule, ScheduleModule, ConflictsModule, LeaveModule, AuthModule, UsersModule],
})
export class AppModule {}
