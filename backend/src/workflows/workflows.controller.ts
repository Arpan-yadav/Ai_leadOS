import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workflows')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new visual automation workflow' })
  create(@Body() createWorkflowDto: CreateWorkflowDto, @Request() req: any) {
    return this.workflowsService.create(createWorkflowDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all automation workflows' })
  findAll() {
    return this.workflowsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific workflow and its definition' })
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workflow (name, status, definition JSON)' })
  update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workflow' })
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
