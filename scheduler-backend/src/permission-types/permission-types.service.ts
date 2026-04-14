
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionTypesService {
  constructor(private readonly prisma: PrismaService) {}

  /* ================= LIST (with search) ================= */
  async findAll(search?: string) {
    return this.prisma.permission_types.findMany({
      where: search
        ? {
            OR: [
              {
                code: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : undefined,

      orderBy: {
        code: 'asc',
      },
    });
  }

  /* ================= CREATE ================= */
  create(dto: CreatePermissionDto) {
    return this.prisma.permission_types.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  /* ================= UPDATE ================= */
  update(code: string, dto: UpdatePermissionDto) {
    return this.prisma.permission_types.update({
      where: { code },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  /* ================= DELETE ================= */
  delete(code: string) {
    return this.prisma.permission_types.delete({
      where: { code },
    });
  }

  /* ================= GET ONE ================= */
  findOne(code: string) {
    return this.prisma.permission_types.findUnique({
      where: { code },
    });
  }

  /* ================= CHECK CODE ================= */
  async checkCode(code: string, excludeCode?: string) {
    const existing = await this.prisma.permission_types.findFirst({
      where: {
        code,
        ...(excludeCode ? { code: { not: excludeCode } } : {}),
      },
    });

    return {
      exists: !!existing,
    };
  }
}