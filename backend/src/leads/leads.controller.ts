/**
 * @file leads.controller.ts
 * @description Leads Controller — Sprint 2, Backend + AI Team
 *
 * REST controller for all lead management endpoints.
 * All routes are JWT-protected. Score field is returned on every lead.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Leads')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead (AI scores it automatically)' })
  @ApiResponse({ status: 201, description: 'Lead created. AI scoring runs async and updates Lead.score within seconds.' })
  create(@Body() dto: CreateLeadDto, @Request() req: any) {
    return this.leadsService.create(dto, req.user.id, req.user.tenantId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create leads via CSV import (AI scores them in background)' })
  @ApiResponse({ status: 201, description: 'Leads created successfully.' })
  createBulk(@Body() dtos: CreateLeadDto[], @Request() req: any) {
    return this.leadsService.createBulk(dtos, req.user.id, req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all leads with pagination, search, and filters' })
  @ApiResponse({ status: 200, description: 'Paginated lead list with AI scores included.' })
  findAll(@Query() query: LeadQueryDto, @Request() req: any) {
    return this.leadsService.findAll(query, req.user.tenantId, req.user.isSuperAdmin);
  }

  @Get('high-intent-count')
  @ApiOperation({ summary: 'Get count of high intent leads (score >= 80)' })
  async getHighIntentCount(@Request() req: any) {
    const count = await this.leadsService.getHighIntentCount(req.user.tenantId, req.user.isSuperAdmin);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full lead detail (includes AI insights, deals, tasks, activities)' })
  @ApiParam({ name: 'id', description: 'Lead ID (cuid)' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.leadsService.findOne(id, req.user.tenantId, req.user.isSuperAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID (cuid)' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Request() req: any) {
    return this.leadsService.update(id, dto, req.user.id, req.user.tenantId, req.user.isSuperAdmin);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID (cuid)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.leadsService.remove(id, req.user.tenantId, req.user.isSuperAdmin);
  }
}
