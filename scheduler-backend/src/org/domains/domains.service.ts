import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { AuditWriter } from 'src/audit/audit-writer.service';


@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService,
    private readonly audit: AuditWriter,
  ) { }

  async create(dto: CreateDomainDto, userId: string) {
    const domain = await this.prisma.domains.create({
      data: {
        name: dto.name,
        description: dto.description,
        exclusive: dto.exclusive ?? false,
        is_active: dto.is_active ?? true,
      },
    });

    await this.audit.domain.created(userId, domain.id, domain);
    return domain;
  }


  async findAll() {
    return this.prisma.domains.findMany({
      include: {
        domain_teams: {
          include: {
            teams: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const domain = await this.prisma.domains.findUnique({
      where: { id },
      include: {
        domain_teams: {
          include: {
            teams: true,
            domainTeamMembers: {
              include: {
                user: true,
              },
            },
          },
        },
        holidays: true,
        domainUsers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!domain) throw new NotFoundException('Domain not found');
    return domain;
  }

  async update(id: string, dto: UpdateDomainDto, userId: string) {
    const before = await this.prisma.domains.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Domain not found');

    const after = await this.prisma.domains.update({
      where: { id },
      data: dto,
    });

    await this.audit.domain.updated(userId, id, before, after);
    return after;
  }


  async remove(id: string, userId: string) {
    const before = await this.prisma.domains.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Domain not found');

    const after = await this.prisma.domains.update({
      where: { id },
      data: { is_active: false },
    });

    await this.audit.domain.deleted(userId, id);
    return after;
  }


  async addUserToDomain(domainId: string, userId: string) {
    return this.prisma.domain_users.create({
      data: {
        domain_id: domainId,
        user_id: userId,
      },
    });
  }

  async removeUserFromDomain(domainId: string, userId: string) {
    return this.prisma.domain_users.deleteMany({
      where: {
        domain_id: domainId,
        user_id: userId,
      },
    });
  }

  async getUsers(domainId: string) {
    return this.prisma.domain_users.findMany({
      where: { domain_id: domainId },
      include: {
        user: true,
      },
    });
  }
}