import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserScopeService } from './user-scope.service';


@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly userScopeService: UserScopeService,) { }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Email already exists.');
    }

    return this.prisma.users.create({
      data: {
        ...dto,
      },
    });
  }

  async findAll(params?: { search?: string; skip?: number; take?: number }) {
    const { search, skip = 0, take = 50 } = params ?? {};

    const users = await this.prisma.users.findMany({
      skip,
      take,
      where: search
        ? {
          OR: [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
        : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        team_members: { include: { teams: true, team_roles: true } },
        user_roles: { include: { global_roles: true } },
        userPermissions: { include: { permission_types: true } },
        userResourceScopes: true,
      },
    });
    return users.map(u => ({
      ...u,
      scope: this.userScopeService.buildScope(u.userResourceScopes),
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        team_members: {
          include: {
            teams: true,
            team_roles: true,
          },
        },
        user_roles: {
          include: {
            global_roles: true,
          },
        },
        userPermissions: {
          include: {
            permission_types: true,
          },
        },
        userResourceScopes: true,
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    // Build scope IDs
    const scope = this.userScopeService.buildScope(user.userResourceScopes);


    const groups = scope.group_ids.length
      ? await this.prisma.groups.findMany({
        where: { id: { in: scope.group_ids } },
      })
      : [];

    const teams = scope.team_ids.length
      ? await this.prisma.teams.findMany({
        where: { id: { in: scope.team_ids } },
      })
      : [];

    const subTeams = scope.subteam_ids.length
      ? await this.prisma.teams.findMany({
        where: {
          id: { in: scope.subteam_ids },
          parent_team_id: { not: null },
        },
      })
      : [];


    const domains = scope.domain_ids.length
      ? await this.prisma.domains.findMany({
        where: { id: { in: scope.domain_ids } },
      })
      : [];

    const rotations = scope.rotation_ids.length
      ? await this.prisma.rotation_definitions.findMany({
        where: { id: { in: scope.rotation_ids } },
      })
      : [];

    return {
      ...user,
      scope,
      scopeEntities: {
        groups,
        teams,
        subTeams,
        domains,
        rotations,
      },
    };
  }




  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');

    if (dto.email && dto.email !== user.email) {
      const exists = await this.prisma.users.findUnique({
        where: { email: dto.email },
      });
      if (exists) throw new BadRequestException('Email already exists.');
    }

    return this.prisma.users.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(id: string) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');

    return this.prisma.users.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');

    // Count checks (optional — you can keep or remove)
    const scopeCount = await this.prisma.user_resource_scope.count({ where: { user_id: id } });
    if (scopeCount > 0) {
      throw new BadRequestException(`Cannot delete user: user still has ${scopeCount} assigned resource scopes.`);
    }

    const permCount = await this.prisma.user_permissions.count({ where: { user_id: id } });
    if (permCount > 0) {
      throw new BadRequestException(`Cannot delete user: user still has ${permCount} assigned permissions.`);
    }

    const roleCount = await this.prisma.user_roles.count({ where: { user_id: id } });
    if (roleCount > 0) {
      throw new BadRequestException(`Cannot delete user: user still has ${roleCount} assigned roles.`);
    }

    await this.prisma.user_sessions.deleteMany({
      where: { user_id: id },
    });

    return this.prisma.users.delete({
      where: { id },
    });
  }


}