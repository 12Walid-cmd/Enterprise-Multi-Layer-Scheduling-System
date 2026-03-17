import { Module } from '@nestjs/common';
import { RotationsController } from './rotations.controller';
import { RotationsService } from './rotations.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RotationsController],
  providers: [RotationsService, PrismaService],
})
export class RotationsModule {}