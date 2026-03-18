// schedule.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleService } from './schedule.service';
import { ScheduleEngine } from './schedule.engine';
import { RotationLoader } from './schedule.rotation-loader';
import { SchedulePersister } from './schedule.persister';

@Module({
  providers: [PrismaService, ScheduleService, ScheduleEngine, RotationLoader, SchedulePersister],
  exports: [ScheduleService],
})
export class ScheduleModule {}