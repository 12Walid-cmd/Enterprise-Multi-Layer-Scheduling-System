import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    first: string,
    last: string,
  ) {
    const hashed = await bcrypt.hash(password, 10);

    return this.prisma.users.create({
      data: {
        email,
        password: hashed,
        first_name: first,
        last_name: last,

        // Required fields in your model
        phone: '',
        timezone: 'UTC',
        working_mode: 'LOCAL',
        is_active: true,

        // Optional fields
        city: null,
        province: null,
        country: null,
      },
    });
  }

  /**
   * Login and return JWT token
   */
  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' },
    );

    return { token };
  }
}