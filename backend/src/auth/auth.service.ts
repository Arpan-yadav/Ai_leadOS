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

    // Seed the 5 default AI Workflows for the new workspace owner
    const { seedDefaultWorkflows } = await import('./seed-defaults');
    await seedDefaultWorkflows(user.id, this.prisma);

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

  // ─── Create Invite ─────────────────────────────────────────────

  async createInvite(tenantId: string, frontendUrl: string) {
    // Generate a secure random token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.invitation.create({
      data: { token, tenantId, expiresAt },
    });

    const inviteUrl = `${frontendUrl}/join?token=${token}`;
    return {
      inviteUrl,
      token,
      expiresAt,
      message: 'Share this link with your team member. It expires in 7 days.',
    };
  }

  // ─── Accept Invite ─────────────────────────────────────────────

  async acceptInvite(dto: { token: string; name: string; email: string; password: string }) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
      include: { tenant: true },
    });

    if (!invitation) {
      throw new UnauthorizedException('Invalid invite link.');
    }
    // Invite is multi-use, so we removed the `invitation.used` check.
    if (new Date() > invitation.expiresAt) {
      throw new UnauthorizedException('This invite link has expired. Ask your admin to generate a new one.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create a Member role for this tenant (or reuse existing)
    let memberRole = await this.prisma.customRole.findFirst({
      where: { tenantId: invitation.tenantId, name: 'Member' },
    });
    if (!memberRole) {
      memberRole = await this.prisma.customRole.create({
        data: {
          name: 'Member',
          tenantId: invitation.tenantId,
          permissions: { viewAllLeads: true, addLeads: true, addTasks: true },
          isDefault: false,
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        tenantId: invitation.tenantId,  // ← same tenant as the inviter!
        roleId: memberRole.id,
        isSuperAdmin: false,
      },
      include: { role: true },
    });

    // We no longer mark the invite as used so multiple users can register.
    // await this.prisma.invitation.update({
    //   where: { token: dto.token },
    //   data: { used: true },
    // });

    const token = this.signToken(user.id, user.email, user.role?.name || 'Member', user.tenantId ?? '', user.isSuperAdmin);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'Member',
        tenantId: user.tenantId ?? '',
        isSuperAdmin: user.isSuperAdmin,
      },
      accessToken: token,
    };
  }
}

