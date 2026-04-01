import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LeaveController],
  providers: [LeaveService, PrismaService],
  exports: [LeaveService],
})
export class LeaveModule {}