import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Deals')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  @ApiResponse({ status: 201, description: 'Deal successfully created.' })
  create(@Body() dto: CreateDealDto, @Request() req: any) {
    return this.dealsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all deals' })
  @ApiResponse({ status: 200, description: 'List of deals retrieved successfully.' })
  findAll() {
    return this.dealsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific deal' })
  @ApiParam({ name: 'id', description: 'Deal ID (cuid)' })
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update deal pipeline stage and auto-log activity' })
  @ApiParam({ name: 'id', description: 'Deal ID (cuid)' })
  updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
    @Request() req: any,
  ) {
    return this.dealsService.updateStage(id, dto.stage, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing deal' })
  @ApiParam({ name: 'id', description: 'Deal ID (cuid)' })
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a deal' })
  @ApiParam({ name: 'id', description: 'Deal ID (cuid)' })
  remove(@Param('id') id: string) {
    return this.dealsService.remove(id);
  }
}