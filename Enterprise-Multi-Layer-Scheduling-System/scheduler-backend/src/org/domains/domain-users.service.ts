
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddUserToDomainTeamDto } from './dto/add-user-to-domain-team.dto';


@Injectable()
export class DomainUsersService {
  constructor(private readonly prisma: PrismaService) {}

  getUsers(domainId: string) {
    return this.prisma.domain_users.findMany({
      where: { domain_id: domainId },
      include: { user: true },
    });
  }

  addUser(domainId: string, dto: AddUserToDomainTeamDto) {
    return this.prisma.domain_users.create({
      data: {
        domain_id: domainId,
        user_id: dto.user_id,
      },
    });
  }

  removeUser(domainId: string, userId: string) {
    return this.prisma.domain_users.delete({
      where: {
        domain_id_user_id: {
          domain_id: domainId,
          user_id: userId,
        },
      },
    });
  }
}