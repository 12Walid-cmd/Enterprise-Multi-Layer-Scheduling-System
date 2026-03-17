import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';

import { RotationsModule } from '../rotations/rotations.module';
import { UsersModule } from '../users/users.module';
import { LeaveModule } from '../leave/leave.module';
import { RulesModule } from '../rules/rules.module';
import { ConflictsModule } from '../conflicts/conflicts.module';
import { OrgModule } from '../org/org.module';

import { CadenceCalculator } from './engine/cadence-calculator';
import { RotationEngine } from './engine/rotation-engine';
import { LeaveBlocker } from './engine/leave-blocker';
import { RulesApplier } from './engine/rules-applier';
import { ConflictChecker } from './engine/conflict-checker';

@Module({
  imports: [
    RotationsModule,
    UsersModule,
    LeaveModule,
    RulesModule,
    ConflictsModule,
    OrgModule,
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    CadenceCalculator,
    RotationEngine,
    LeaveBlocker,
    RulesApplier,
    ConflictChecker,
  ],
})
export class ScheduleModule {}