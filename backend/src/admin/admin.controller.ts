import {
  Controller, Get, Patch, Delete, Param, Body,
  UseGuards, ForbiddenException, Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  // Read allowed: ADMIN + MANAGER. Write (role change, delete, reset pwd): ADMIN only.
  private checkReadAccess(req: any) {
    const role = req.user?.role;
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      throw new ForbiddenException('Admin or Manager access required to view admin panel');
    }
  }

  private checkAdminOnly(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only Admins can perform this action');
    }
  }

  // ─── GET /admin/stats ──────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'System-wide stats for admin dashboard' })
  async getStats(@Request() req: any) {
    this.checkReadAccess(req);
    const [users, leads, deals, workflows, sequences] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lead.count(),
      this.prisma.deal.count(),
      this.prisma.workflow.count(),
      this.prisma.sequence.count(),
    ]);
    const wonRevenue = await this.prisma.deal.aggregate({
      where: { stage: 'WON' },
      _sum: { amount: true },
    });
    return {
      users,
      leads,
      deals,
      workflows,
      sequences,
      wonRevenue: wonRevenue._sum?.amount ?? 0,
    };
  }

  // ─── GET /admin/users ──────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({ summary: 'List all users with activity stats' })
  async listUsers(@Request() req: any) {
    this.checkReadAccess(req);
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            leads: true,
            deals: true,
            activities: true,
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  // ─── PATCH /admin/users/:id/role ──────────────────────────────────────────
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update a user role (Admin only)' })
  async updateRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    this.checkAdminOnly(req);
    const validRoles = ['ADMIN', 'MANAGER', 'EXECUTIVE'];
    if (!validRoles.includes(body.role)) {
      throw new ForbiddenException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: body.role as any },
      select: { id: true, name: true, email: true, role: true },
    });
    return { success: true, user };
  }

  // ─── PATCH /admin/users/:id/reset-password ────────────────────────────────
  @Patch('users/:id/reset-password')
  @ApiOperation({ summary: 'Reset a user password (Admin only)' })
  async resetPassword(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    this.checkAdminOnly(req);
    if (!body.newPassword || body.newPassword.length < 8) {
      throw new ForbiddenException('Password must be at least 8 characters');
    }
    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hashed } });
    return { success: true, message: 'Password reset successfully' };
  }

  // ─── DELETE /admin/users/:id ───────────────────────────────────────────────
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user (Admin only, cannot delete self)' })
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    this.checkAdminOnly(req);
    if (req.user.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'User deleted' };
  }
}
