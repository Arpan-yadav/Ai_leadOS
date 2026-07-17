import {
  Controller, Get, Patch, Delete, Param, Body, Post,
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

  private checkSuperAdmin(req: any) {
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Only the Supreme Admin can access the admin panel');
    }
  }

  // ─── GET /admin/stats ──────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'System-wide stats for admin dashboard' })
  async getStats(@Request() req: any) {
    this.checkSuperAdmin(req);
    const tenantId = req.user.tenantId;
    const [users, leads, deals, workflows, sequences] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.deal.count({ where: { tenantId } }),
      this.prisma.workflow.count({ where: { tenantId } }),
      this.prisma.sequence.count({ where: { tenantId } }),
    ]);
    const wonRevenue = await this.prisma.deal.aggregate({
      where: { tenantId, stage: 'WON' },
      _sum: { amount: true },
    });
    return {
      users, leads, deals, workflows, sequences,
      wonRevenue: wonRevenue._sum?.amount ?? 0,
    };
  }

  // ─── GET /admin/users ──────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@Request() req: any) {
    this.checkSuperAdmin(req);
    const users = await this.prisma.user.findMany({
      where: { tenantId: req.user.tenantId },
      select: {
        id: true, name: true, email: true, isSuperAdmin: true, createdAt: true,
        role: { select: { id: true, name: true } },
        _count: { select: { leads: true, deals: true, activities: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  // ─── PATCH /admin/users/:id/role ──────────────────────────────────────────
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update a user role' })
  async updateRole(@Request() req: any, @Param('id') id: string, @Body() body: { roleId: string }) {
    this.checkSuperAdmin(req);
    const user = await this.prisma.user.update({
      where: { id, tenantId: req.user.tenantId },
      data: { roleId: body.roleId },
      select: { id: true, name: true, email: true, role: { select: { id: true, name: true } } },
    });
    return { success: true, user };
  }

  @Patch('users/:id/reset-password')
  async resetPassword(@Request() req: any, @Param('id') id: string, @Body() body: { newPassword: string }) {
    this.checkSuperAdmin(req);
    if (!body.newPassword || body.newPassword.length < 8) throw new ForbiddenException('Password must be at least 8 characters');
    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({ where: { id, tenantId: req.user.tenantId }, data: { password: hashed } });
    return { success: true, message: 'Password reset successfully' };
  }

  @Delete('users/:id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    this.checkSuperAdmin(req);
    if (req.user.id === id) throw new ForbiddenException('You cannot delete your own account');
    await this.prisma.user.delete({ where: { id, tenantId: req.user.tenantId } });
    return { success: true, message: 'User deleted' };
  }

  // ─── ROLES MANAGEMENT ─────────────────────────────────────────────────────
  @Get('roles')
  async listRoles(@Request() req: any) {
    this.checkSuperAdmin(req);
    return this.prisma.customRole.findMany({
      where: { tenantId: req.user.tenantId },
    });
  }

  @Post('roles')
  async createRole(@Request() req: any, @Body() body: { name: string, permissions: any }) {
    this.checkSuperAdmin(req);
    return this.prisma.customRole.create({
      data: {
        name: body.name,
        permissions: body.permissions,
        tenantId: req.user.tenantId,
        isDefault: false,
      }
    });
  }

  @Delete('roles/:id')
  async deleteRole(@Request() req: any, @Param('id') id: string) {
    this.checkSuperAdmin(req);
    const role = await this.prisma.customRole.findUnique({ where: { id, tenantId: req.user.tenantId } });
    if (role?.isDefault) throw new ForbiddenException('Cannot delete default roles');
    await this.prisma.customRole.delete({ where: { id, tenantId: req.user.tenantId } });
    return { success: true };
  }
}
