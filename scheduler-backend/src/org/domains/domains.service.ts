import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDomainDto, DomainType } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { AuditWriter } from 'src/audit/audit-writer.service';

@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditWriter,
  ) {}

  /* ================= CREATE ================= */
  async create(dto: CreateDomainDto, userId: string) {
    const domain = await this.prisma.domains.create({
      data: {
        name: dto.name,
        description: dto.description,
        exclusive: dto.exclusive ?? false,
        is_active: dto.is_active ?? true,
        owner_user_id: dto.owner_user_id ?? null,
        type: dto.type ?? DomainType.CAPABILITY,
      },
    });

    await this.audit.domain.created(userId, domain.id, domain);
    return domain;
  }

  /* ================= LIST ================= */
  async findAll(search?: string) {
    return this.prisma.domains.findMany({
      where: {
        is_active: true,

        ...(search
          ? {
              OR: [
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
          : {}),
      },

      select: {
        id: true,
        name: true,
        description: true,
        exclusive: true,
        is_active: true,
        created_at: true,

      
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },

      
        _count: {
          select: {
            domain_teams: true,
            domainUsers: true,
          },
        },
      },

      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /* ================= DETAIL ================= */
  async findOne(id: string) {
    const domain = await this.prisma.domains.findUnique({
      where: { id },

      include: {
        owner: true,

        domain_teams: {
          include: {
            teams: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        domainUsers: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },

        holidays: true,
      },
    });

    if (!domain) throw new NotFoundException('Domain not found');

    return domain;
  }

  /* ================= UPDATE ================= */
  async update(id: string, dto: UpdateDomainDto, userId: string) {
    const before = await this.prisma.domains.findUnique({
      where: { id },
    });

    if (!before) throw new NotFoundException('Domain not found');

    const after = await this.prisma.domains.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        exclusive: dto.exclusive,
        is_active: dto.is_active,
        type: dto.type ?? undefined,
        owner_user_id:
          dto.owner_user_id !== undefined
            ? dto.owner_user_id
            : undefined,
      },
    });

    await this.audit.domain.updated(userId, id, before, after);
    return after;
  }

  /* ================= DELETE (SOFT) ================= */
  async remove(id: string, userId: string) {
    const before = await this.prisma.domains.findUnique({
      where: { id },
    });

    if (!before) throw new NotFoundException('Domain not found');

    const after = await this.prisma.domains.update({
      where: { id },
      data: {
        is_active: false,
      },
    });

    await this.audit.domain.deleted(userId, id);
    return after;
  }
}