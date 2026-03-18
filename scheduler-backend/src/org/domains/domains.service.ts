import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get one domain
  async findOne(id: string) {
    return this.prisma.domains.findUnique({
      where: { id },
      include: {
        domain_teams: {
          include: { teams: true },
        },
      },
    });
  }

  // Get all domains
  async findAll() {
    return this.prisma.domains.findMany({
      include: {
        domain_teams: true,
      },
    });
  }

  // Create domain
  async create(data: {
    name: string;
    description?: string;
    exclusive?: boolean;
  }) {
    return this.prisma.domains.create({ data });
  }

  // Update domain
  async update(id: string, data: any) {
    return this.prisma.domains.update({
      where: { id },
      data,
    });
  }

  // Delete domain
  async delete(id: string) {
    return this.prisma.domains.delete({
      where: { id },
    });
  }
}