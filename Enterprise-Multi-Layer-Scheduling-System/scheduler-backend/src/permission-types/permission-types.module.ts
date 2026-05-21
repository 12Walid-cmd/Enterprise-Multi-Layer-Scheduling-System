import { Module } from '@nestjs/common';
import { PermissionTypesService } from './permission-types.service';
import { PermissionTypesController } from './permission-types.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PermissionTypesController],
  providers: [PermissionTypesService, PrismaService],
  exports: [PermissionTypesService],
})
export class PermissionTypesModule {}