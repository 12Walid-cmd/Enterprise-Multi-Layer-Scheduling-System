import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  // ---------------------------------------------------------
  // Register
  // ---------------------------------------------------------
  async register(dto: RegisterDto, res: Response) {
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
        working_mode: 'LOCAL',
        is_active: true,
        city: null,
        province: null,
        country: null,
      },
    });

    return this.buildTokens(user.id, res, null);
  }

  // ---------------------------------------------------------
  // Login
  // ---------------------------------------------------------
  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!dto.password) throw new BadRequestException('Password is required');
    if (!user.password)
      throw new BadRequestException('User has no password set');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.buildTokens(user.id, res, null);
  }

  // ---------------------------------------------------------
  // Me
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Build Tokens 
  // ---------------------------------------------------------
  private async buildTokens(
    userId: string,
    res: Response,
    req: Request | null,
  ) {
    const fullUser = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        group: true,
        team_members: true,
        subTeamMembers: true,
        domainUsers: true,
        domainTeams: true,
        user_roles: { include: { global_roles: true } },
      },
    });

    // PBAC: Resource Scope
    const resourceScope = await this.prisma.user_resource_scope.findMany({
      where: { user_id: userId },
    });

    // Build PBAC scope structure
    const scope = {
      group_ids: resourceScope
        .filter(r => r.resource_type === 'GROUP')
        .map(r => r.resource_id),

      domain_ids: resourceScope
        .filter(r => r.resource_type === 'DOMAIN')
        .map(r => r.resource_id),

      team_ids: resourceScope
        .filter(r => r.resource_type === 'TEAM')
        .map(r => r.resource_id),

      rotation_ids: resourceScope
        .filter(r => r.resource_type === 'ROTATION')
        .map(r => r.resource_id),
    };

    if (!fullUser) throw new UnauthorizedException('User not found');

    // Access Token payload
    const payload = {
      sub: fullUser.id,
      email: fullUser.email,
      first_name: fullUser.first_name,
      last_name: fullUser.last_name,
      timezone: fullUser.timezone,
      working_mode: fullUser.working_mode,
      group_id: fullUser.group_id,
      team_ids: fullUser.team_members.map(t => t.team_id),
      sub_team_ids: fullUser.subTeamMembers.map(s => s.sub_team_id),
      domain_ids: fullUser.domainUsers.map(d => d.domain_id),
      domain_team_ids: fullUser.domainTeams.map(dt => dt.domain_team_id),
      roles: fullUser.user_roles.map(r => r.global_roles.code),
      permissions: [],
      scope,
    };

    // Session metadata
    const userAgent = req?.headers['user-agent'] ?? null;
    const ip =
      (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req?.ip ??
      null;

    // Create session
    const session = await this.prisma.user_sessions.create({
      data: {
        user_id: fullUser.id,
        refresh_token_hash: '',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user_agent: userAgent,
        ip_address: ip,
      },
    });

    // Access Token
    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: '25m',
    });

    // Refresh Token payload
    const refreshPayload = {
      sub: fullUser.id,
      sid: session.id,
    };

    const refresh_token = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Save refresh token hash
    const hash = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user_sessions.update({
      where: { id: session.id },
      data: { refresh_token_hash: hash },
    });

    // Set HttpOnly Cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true, // dev : false
      sameSite: 'strict',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token };
  }

  // ---------------------------------------------------------
  // Refresh Token Rotation
  // ---------------------------------------------------------
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken)
      throw new UnauthorizedException('Missing refresh token');

    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.user_sessions.findUnique({
      where: { id: payload.sid },
    });

    if (!session) throw new UnauthorizedException('Session not found');
    if (session.revoked_at) throw new UnauthorizedException('Session revoked');
    if (session.expires_at < new Date())
      throw new UnauthorizedException('Session expired');

    const match = await bcrypt.compare(refreshToken, session.refresh_token_hash);
    if (!match) throw new UnauthorizedException('Invalid refresh token');

    // Update session metadata
    await this.prisma.user_sessions.update({
      where: { id: session.id },
      data: {
        last_used_at: new Date(),
        user_agent: req.headers['user-agent'] ?? session.user_agent,
        ip_address:
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
          req.ip ??
          session.ip_address,
      },
    });

    return this.buildTokens(payload.sub, res, req);
  }

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      res.clearCookie('refresh_token', { path: '/auth' });
      return { message: 'Logged out' };
    }

    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      res.clearCookie('refresh_token', { path: '/auth' });
      return { message: 'Logged out' };
    }

    await this.prisma.user_sessions.update({
      where: { id: payload.sid },
      data: { revoked_at: new Date(), revoked_reason: 'logout' },
    });

    res.clearCookie('refresh_token', { path: '/auth' });

    return { message: 'Logged out' };
  }

  async sessions(userId: string) {
    const sessions = await this.prisma.user_sessions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        ip_address: true,
        user_agent: true,
        created_at: true,
        last_used_at: true,
        revoked_at: true,
      },
    });

    return sessions;
  }

  async logoutAll(userId: string, res: Response) {
    await this.prisma.user_sessions.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: {
        revoked_at: new Date(),
        revoked_reason: 'logout_all',
      },
    });

    // clear cookie
    res.clearCookie('refresh_token', { path: '/auth' });

    return { message: 'All sessions logged out' };
  }
}