import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async testAssignments() {
    const result = await this.prisma.assignments.findMany();
    console.log(result);
    return result;
  }
}