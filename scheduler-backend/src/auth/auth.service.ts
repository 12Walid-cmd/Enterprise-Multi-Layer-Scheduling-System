import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/register.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Email already exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        password: hash,
        phone: dto.phone,
        timezone: dto.timezone,
        // working_mode, is_active
        working_mode: 'LOCAL',
        is_active: true,

        // Optional fields
        city: null,
        province: null,
        country: null,
      },
    });

    return this.buildTokens(user);
  }

  async me(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        timezone: true,
        working_mode: true,
        city: true,
        province: true,
        country: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!dto.password) {
      throw new BadRequestException("Password is required");
    }

    if (!user.password) {
      throw new BadRequestException("User has no password set");
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.buildTokens(user);
  }

  private async buildTokens(user: { id: string; email: string }) {
    const fullUser = await this.prisma.users.findUnique({
      where: { id: user.id },
      include: {
        // Group
        group: true,

        // Team-level
        team_members: true,
        subTeamMembers: true,

        // Domain-level
        domainUsers: true,
        domainTeams: true,

        // Global roles
        user_roles: {
          include: {
            global_roles: true,
          },
        },
      },
    });
    if (!fullUser) {
      throw new UnauthorizedException("User not found");
    }


    //  JWT payload（
    const payload = {
      sub: fullUser.id,
      email: fullUser.email,

      first_name: fullUser.first_name,
      last_name: fullUser.last_name,
      timezone: fullUser.timezone,
      working_mode: fullUser.working_mode,

      // Group-level
      group_id: fullUser.group_id,

      // Team-level
      team_ids: fullUser.team_members.map(t => t.team_id),
      sub_team_ids: fullUser.subTeamMembers.map(s => s.sub_team_id),

      // Domain-level
      domain_ids: fullUser.domainUsers.map(d => d.domain_id),
      domain_team_ids: fullUser.domainTeams.map(dt => dt.domain_team_id),

      // Global roles
      roles: fullUser.user_roles.map(r => r.global_roles.code),

      // Permissions（PBAC）
      permissions: [], // to do
    };

    // token
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }
}