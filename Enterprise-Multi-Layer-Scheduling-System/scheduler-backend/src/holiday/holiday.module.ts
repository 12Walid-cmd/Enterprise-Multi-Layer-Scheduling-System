import { Module } from '@nestjs/common';
import { HolidayController } from './holiday.controller';
import { HolidayService } from './holiday.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditModule } from 'src/audit/audit.module';

@Module({
    imports: [AuditModule],
    controllers: [HolidayController],
    providers: [HolidayService, PrismaService],
    exports: [HolidayService],
})
export class HolidayModule { }