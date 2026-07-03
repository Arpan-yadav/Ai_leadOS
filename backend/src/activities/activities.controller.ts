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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activities')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead activity' })
  @ApiResponse({ status: 201, description: 'Activity successfully created.' })
  create(@Body() dto: CreateActivityDto, @Request() req: any) {
    return this.activitiesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List activities, optionally filtered by lead' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully.' })
  findAll(@Query() query: ActivityQueryDto) {
    return this.activitiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific activity' })
  @ApiParam({ name: 'id', description: 'Activity ID (cuid)' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing activity' })
  @ApiParam({ name: 'id', description: 'Activity ID (cuid)' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiParam({ name: 'id', description: 'Activity ID (cuid)' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}