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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task linked to a lead' })
  @ApiResponse({ status: 201, description: 'Task successfully created.' })
  create(@Body() dto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with pagination and status filter' })
  @ApiResponse({ status: 200, description: 'List of tasks retrieved successfully.' })
  findAll(@Query() query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific task' })
  @ApiParam({ name: 'id', description: 'Task ID (cuid)' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing task' })
  @ApiParam({ name: 'id', description: 'Task ID (cuid)' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark a task as completed' })
  @ApiParam({ name: 'id', description: 'Task ID (cuid)' })
  complete(@Param('id') id: string) {
    return this.tasksService.complete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID (cuid)' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}