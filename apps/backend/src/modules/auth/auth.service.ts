import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash },
    });

    return this.buildAuthResponse(user.id, user.email, user.name, user.inviteCode);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user.id, user.email, user.name, user.inviteCode);
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: delete the old token, issue a fresh pair
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.buildAuthResponse(
      stored.user.id,
      stored.user.email,
      stored.user.name,
      stored.user.inviteCode
    );
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  private async buildAuthResponse(
    userId: string,
    email: string,
    name: string,
    inviteCode: string
  ) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      { secret: process.env.JWT_SECRET || 'dev_secret_change_me', expiresIn: '15m' }
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
        expiresIn: '30d',
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, name, inviteCode },
    };
  }
}
