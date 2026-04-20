// schedule.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleService } from './schedule.service';
import { ScheduleEngine } from './schedule.engine';
import { RotationLoader } from './schedule.rotation-loader';
import { SchedulePersister } from './schedule.persister';
import { CalendarService } from './schedule.calendar.service';
import { ConstraintPipeline } from './schedule.constraint.pipeline';
import { CONSTRAINTS } from './schedule.types';

// import constraints
import { DomainMinimumConstraint } from './constraints/domain-min.constraint';
import { EffectiveDateConstraint } from './constraints/effective-date.constraint';
import { FreezeDateConstraint } from './constraints/freeze-date.constraint';
import { HolidayConstraint } from './constraints/holiday.constraint';
import { LeaveConstraint } from './constraints/leave.constraint';
import { OverlapConstraint } from './constraints/overlap.constraint';
import { RoleConflictConstraint } from './constraints/role-conflict.constraint';
import { StaffingMinimumConstraint } from './constraints/staffing-min.constraint';
import { BlockLengthConstraint } from './constraints/block-length.constraint';


@Module({
  providers: [PrismaService, CalendarService, ScheduleService, ScheduleEngine, RotationLoader, SchedulePersister, ConstraintPipeline, 
    // constraints 
    DomainMinimumConstraint,
    EffectiveDateConstraint,
    FreezeDateConstraint,
    HolidayConstraint,
    LeaveConstraint,
    OverlapConstraint,
    RoleConflictConstraint,
    StaffingMinimumConstraint,
    BlockLengthConstraint,
    // constraints  provider
    {
      provide: CONSTRAINTS,
      useFactory: (
        domainMin: DomainMinimumConstraint,
        effectiveDate: EffectiveDateConstraint,
        freezeDate: FreezeDateConstraint,
        holiday: HolidayConstraint,
        leave: LeaveConstraint,
        overlap: OverlapConstraint,
        roleConflict: RoleConflictConstraint,
        staffingMin: StaffingMinimumConstraint,
        blockLength: BlockLengthConstraint
      ) => [
          domainMin,
          effectiveDate,
          freezeDate,
          holiday,
          leave,
          overlap,
          roleConflict,
          staffingMin,
          blockLength
        ],
      inject: [
        DomainMinimumConstraint,
        EffectiveDateConstraint,
        FreezeDateConstraint,
        HolidayConstraint,
        LeaveConstraint,
        OverlapConstraint,
        RoleConflictConstraint,
        DomainMinimumConstraint,
        BlockLengthConstraint
      ],
    },

    // pipeline + engine + service
    ConstraintPipeline,
    ScheduleEngine,
    SchedulePersister,
    RotationLoader,
    ScheduleService,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule { }