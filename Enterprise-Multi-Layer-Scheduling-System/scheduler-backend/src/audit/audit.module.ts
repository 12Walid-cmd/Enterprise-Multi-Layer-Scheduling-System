import { Module } from '@nestjs/common';
import { AuditWriter } from './audit-writer.service';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    AuditWriter,
    AuditLogService,
    PrismaService,
  ],
  controllers: [AuditLogController],
  exports: [AuditWriter],  
})
export class AuditModule {}