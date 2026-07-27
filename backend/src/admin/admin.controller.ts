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
      throw new ForbiddenException('Only the Supreme Admin can access this resource');
    }
  }

  // Helper to scope queries. SuperAdmins can optionally bypass if needed, but standard tabs scope to their own tenant.
  private getTenantFilter(req: any) {
    // We could return {} for super admins to make all tabs global, but it's cleaner to keep tabs scoped to the workspace, 
    // except for the Supreme Admin who can see global stats.
    return { tenantId: req.user.tenantId };
  }

  // ─── GET /admin/stats ──────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'System-wide stats for admin dashboard' })
  async getStats(@Request() req: any) {
    // If Super Admin, show global stats. Otherwise, show tenant stats.
    const filter = req.user.isSuperAdmin ? {} : { tenantId: req.user.tenantId };
    
    const [users, leads, deals, workflows, sequences, tenants] = await Promise.all([
      this.prisma.user.count({ where: filter }),
      this.prisma.lead.count({ where: filter }),
      this.prisma.deal.count({ where: filter }),
      this.prisma.workflow.count({ where: filter }),
      this.prisma.sequence.count({ where: filter }),
      req.user.isSuperAdmin ? this.prisma.tenant.count() : Promise.resolve(0),
    ]);
    const wonRevenue = await this.prisma.deal.aggregate({
      where: { ...filter, stage: 'WON' },
      _sum: { amount: true },
    });
    return {
      users, leads, deals, workflows, sequences, tenants,
      wonRevenue: wonRevenue._sum?.amount ?? 0,
    };
  }

  // ─── GET /admin/users ──────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({ summary: 'List all users in the workspace' })
  async listUsers(@Request() req: any) {
    // Show users in the current workspace
    const users = await this.prisma.user.findMany({
      where: { tenantId: req.user.tenantId },
      select: {
        id: true, name: true, email: true, isSuperAdmin: true, createdAt: true,
        tenant: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        _count: { select: { leads: true, deals: true, activities: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  // ─── GET /admin/tenants ────────────────────────────────────────────────────
  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants' })
  async listTenants(@Request() req: any) {
    this.checkSuperAdmin(req);
    return this.prisma.tenant.findMany({
      include: {
        _count: { select: { users: true, leads: true, Deal: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('tenants/:id/details')
  @ApiOperation({ summary: 'Get details of a specific tenant (users & leads)' })
  async getTenantDetails(@Request() req: any, @Param('id') tenantId: string) {
    this.checkSuperAdmin(req);
    const [users, leads, tenant] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        select: { id: true, name: true, email: true, role: { select: { name: true } }, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.lead.findMany({
        where: { tenantId },
        select: { id: true, name: true, company: true, status: true, score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to recent leads for performance
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true }
      })
    ]);
    return { tenant, users, leads };
  }

  // ─── PATCH /admin/users/:id/role ──────────────────────────────────────────
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update a user role' })
  async updateRole(@Request() req: any, @Param('id') id: string, @Body() body: { roleId: string }) {
    const user = await this.prisma.user.update({
      where: { id, tenantId: req.user.tenantId },
      data: { roleId: body.roleId },
      select: { id: true, name: true, email: true, role: { select: { id: true, name: true } } },
    });
    return { success: true, user };
  }

  @Patch('users/:id/reset-password')
  async resetPassword(@Request() req: any, @Param('id') id: string, @Body() body: { newPassword: string }) {
    if (!body.newPassword || body.newPassword.length < 8) throw new ForbiddenException('Password must be at least 8 characters');
    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({ where: { id, tenantId: req.user.tenantId }, data: { password: hashed } });
    return { success: true, message: 'Password reset successfully' };
  }

  @Delete('users/:id')
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    if (req.user.id === id) throw new ForbiddenException('You cannot delete your own account');
    await this.prisma.user.delete({ where: { id, tenantId: req.user.tenantId } });
    return { success: true, message: 'User deleted' };
  }

  // ─── ROLES MANAGEMENT ─────────────────────────────────────────────────────
  @Get('roles')
  async listRoles(@Request() req: any) {
    return this.prisma.customRole.findMany({
      where: { tenantId: req.user.tenantId }
    });
  }

  @Post('roles')
  async createRole(@Request() req: any, @Body() body: { name: string, permissions: any }) {
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
    const role = await this.prisma.customRole.findUnique({ where: { id, tenantId: req.user.tenantId } });
    if (role?.isDefault) throw new ForbiddenException('Cannot delete default roles');
    await this.prisma.customRole.delete({ where: { id, tenantId: req.user.tenantId } });
    return { success: true };
  }
}
