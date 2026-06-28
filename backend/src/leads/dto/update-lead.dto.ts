/**
 * @file update-lead.dto.ts
 * @description DTO for updating a lead — Sprint 2, Backend + AI Team
 */

import { PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}
