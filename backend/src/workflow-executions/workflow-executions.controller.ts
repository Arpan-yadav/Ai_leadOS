import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workflow Executions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('workflow-executions')
export class WorkflowExecutionsController {
  constructor(private readonly workflowExecutionsService: WorkflowExecutionsService) {}

  @Post(':workflowId/start')
  @ApiOperation({ summary: 'Manually start a workflow execution' })
  start(
    @Param('workflowId') workflowId: string,
    @Body('leadId') leadId?: string,
    @Body('context') context?: Record<string, any>,
  ) {
    return this.workflowExecutionsService.startExecution(workflowId, leadId, context);
  }

  @Patch(':id/stop')
  @ApiOperation({ summary: 'Stop a running workflow execution' })
  stop(@Param('id') id: string) {
    return this.workflowExecutionsService.stopExecution(id);
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Pause a running workflow execution' })
  pause(@Param('id') id: string) {
    return this.workflowExecutionsService.pauseExecution(id);
  }

  @Get('workflow/:workflowId')
  @ApiOperation({ summary: 'Get all executions for a specific workflow' })
  findAllForWorkflow(@Param('workflowId') workflowId: string) {
    return this.workflowExecutionsService.findAllForWorkflow(workflowId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and logs of a specific execution' })
  findOne(@Param('id') id: string) {
    return this.workflowExecutionsService.findOne(id);
  }
}
