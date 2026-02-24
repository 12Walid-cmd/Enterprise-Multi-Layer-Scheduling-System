import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrgModule } from './modules/org/org.module';
import { RotationsModule } from './modules/rotations/rotations.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ConflictsModule } from './modules/conflicts/conflicts.module';
import { LeaveModule } from './modules/leave/leave.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [OrgModule, RotationsModule, ScheduleModule, ConflictsModule, LeaveModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
