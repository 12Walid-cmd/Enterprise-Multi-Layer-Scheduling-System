import { Module } from '@nestjs/common';
import { RotationsController } from './rotations.controller';
import { RotationsService } from './rotations.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { TierController } from './tier/tier.controller';
import { TierService } from './tier/tier.service';
import { RotationRulesController } from './rule/rule.controller';
import { RotationRulesService } from './rule/rule.service';

@Module({
  imports: [ScheduleModule],
  controllers: [
    RotationsController,
    TierController,   
    RotationRulesController
  ],
  providers: [
    RotationsService,
    TierService,           
    PrismaService,
    RotationRulesService
  ],
})
export class RotationsModule {}