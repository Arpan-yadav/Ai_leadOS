/**
 * @file auth.service.ts
 * @description Authentication Service — Login & Register logic
 * Sprint 1 — Backend Team Deliverable
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── Register ──────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // For new registrations without an invite, we create a new Tenant
    // In a real app, you might have a separate flow for joining a tenant.
    const tenant = await this.prisma.tenant.create({
      data: { name: `${dto.name}'s Company` }
    });

    const adminRole = await this.prisma.customRole.create({
      data: {
        name: 'Admin',
        tenantId: tenant.id,
        permissions: { manageUsers: true, manageSettings: true, viewAllLeads: true, deleteData: true },
        isDefault: true
      }
    });

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        tenantId: tenant.id,
        roleId: adminRole.id,
        isSuperAdmin: false,
      },
      include: { role: true },
    });

    const token = this.signToken(user.id, user.email, user.role?.name || 'User', user.tenantId ?? "", user.isSuperAdmin);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'User',
        tenantId: user.tenantId ?? "",
        isSuperAdmin: user.isSuperAdmin,
      },
      accessToken: token,
    };
  }

  // ─── Login ─────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.signToken(user.id, user.email, user.role?.name || 'User', user.tenantId ?? "", user.isSuperAdmin);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'User',
        tenantId: user.tenantId ?? "",
        isSuperAdmin: user.isSuperAdmin,
      },
      accessToken: token,
    };
  }

  // ─── Helper ────────────────────────────────────────────────────

  private signToken(userId: string, email: string, role: string, tenantId: string, isSuperAdmin: boolean): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
      tenantId,
      isSuperAdmin,
    });
  }


  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { success: true, message: 'Password changed successfully.' };
  }
}
