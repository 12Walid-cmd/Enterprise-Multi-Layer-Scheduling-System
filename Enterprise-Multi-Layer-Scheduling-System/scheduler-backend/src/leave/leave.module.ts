import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [LeaveController],
  providers: [LeaveService, PrismaService],
  exports: [LeaveService],
})
export class LeaveModule {}