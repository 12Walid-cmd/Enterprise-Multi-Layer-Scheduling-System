import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

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

    return this.prisma.users.findMany({
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
      },
    });
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
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
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

    return this.prisma.users.delete({ where: { id } });
  }
}