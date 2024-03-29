import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePayload } from '../common/base-payload.dto';

export class QueryPartnerDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Search by Partner Name (using LIKE sql)',
    example: 'PT. Indocahya',
  })
  name__icontains: string;

  @ApiPropertyOptional({
    description: 'Search by Partner Code (using LIKE sql)',
    example: 'HR_SICEPAT',
  })
  code__icontains: string;

  @ApiPropertyOptional({
    description: 'Partner Status',
    example: 'approved',
    enum: ['draft', 'approved', 'rejected'],
  })
  state: string;

  @ApiPropertyOptional({
    description: 'Partner Type',
    example: 'company',
    enum: ['personal', 'company'],
  })
  type: string;
}

export class QueryReportPartnerDTO {
  @ApiPropertyOptional({
    description: 'Search by Partner Name (using LIKE sql)',
    example: 'PT. Indocahya',
  })
  name__icontains: string;

  @ApiPropertyOptional({
    description: 'Search by Partner Code (using LIKE sql)',
    example: 'HR_SICEPAT',
  })
  code__icontains: string;

  @ApiPropertyOptional({
    description: 'Partner Status',
    example: 'approved',
    enum: ['draft', 'approved', 'rejected'],
  })
  state: string;

  @ApiPropertyOptional({
    description: 'Partner Type',
    example: 'company',
    enum: ['personal', 'company'],
  })
  type: string;
}