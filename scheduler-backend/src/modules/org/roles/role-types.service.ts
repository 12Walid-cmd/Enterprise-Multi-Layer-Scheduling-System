import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RoleTypesService {
  constructor(private prisma: PrismaService) {}

  create(data) {
    return this.prisma.role_types.create({ data });
  }

  findAll() {
    return this.prisma.role_types.findMany();
  }

  update(id: string, data) {
    return this.prisma.role_types.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.role_types.delete({
      where: { id },
    });
  }
}