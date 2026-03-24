import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';


@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateDomainDto) {
    return this.prisma.domains.create({
      data: {
        name: dto.name,
        description: dto.description,
        exclusive: dto.exclusive ?? false,
        is_active: dto.is_active ?? true,
      },
    });
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

  async update(id: string, dto: UpdateDomainDto) {
    return this.prisma.domains.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.domains.update({
      where: { id },
      data: { is_active: false },
    });
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