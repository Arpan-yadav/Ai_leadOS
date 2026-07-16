import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SequencesService } from './sequences.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sequences')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('sequences')
export class SequencesController {
  constructor(private readonly sequencesService: SequencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new outreach sequence' })
  @ApiResponse({ status: 201, description: 'Sequence successfully created.' })
  create(@Body() dto: CreateSequenceDto, @Request() req: any) {
    return this.sequencesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all sequences' })
  findAll() {
    return this.sequencesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific sequence' })
  @ApiParam({ name: 'id', description: 'Sequence ID (cuid)' })
  findOne(@Param('id') id: string) {
    return this.sequencesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing sequence' })
  @ApiParam({ name: 'id', description: 'Sequence ID (cuid)' })
  update(@Param('id') id: string, @Body() dto: UpdateSequenceDto) {
    return this.sequencesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sequence' })
  @ApiParam({ name: 'id', description: 'Sequence ID (cuid)' })
  remove(@Param('id') id: string) {
    return this.sequencesService.remove(id);
  }

  @Post(':id/enroll/:leadId')
  @ApiOperation({ summary: 'Enroll a lead into a sequence' })
  @ApiParam({ name: 'id', description: 'Sequence ID (cuid)' })
  @ApiParam({ name: 'leadId', description: 'Lead ID (cuid)' })
  enrollLead(@Param('id') id: string, @Param('leadId') leadId: string) {
    return this.sequencesService.enrollLead(id, leadId);
  }

  @Post('enrollments/:enrollmentId/advance')
  @ApiOperation({ summary: 'Manually advance an active enrollment to the next step' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID (cuid)' })
  advanceEnrollment(@Param('enrollmentId') enrollmentId: string) {
    return this.sequencesService.advanceEnrollment(enrollmentId);
  }

  @Post('enrollments/:enrollmentId/undo/:targetStep')
  @ApiOperation({ summary: 'Manually undo an active enrollment to a specific step' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID (cuid)' })
  @ApiParam({ name: 'targetStep', description: 'Target step number' })
  undoEnrollment(@Param('enrollmentId') enrollmentId: string, @Param('targetStep') targetStep: string) {
    return this.sequencesService.undoEnrollment(enrollmentId, parseInt(targetStep, 10));
  }
}
