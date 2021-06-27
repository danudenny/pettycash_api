import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { BasePayload } from '../common/base-payload.dto';

export class QueryReportParkingJournalDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Journal Start Date',
    example: '2021-01-01',
  })
  startDate__gte?: Date;

  @ApiPropertyOptional({
    description: 'Journal End Date',
    example: '2021-06-30',
  })
  endDate__lte?: Date;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: '5bc9efdf-187c-4ec3-bc20-4002185f2e98',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: '4efcf567-0aa7-4cdf-b928-cc9c4521c17b',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Journal Number to search',
    example: 'JRNL20200201AAA123',
  })
  number__icontains: string;

  @ApiPropertyOptional({
    description: 'Journal Reference to search',
    example: 'EXP202103AAA123',
  })
  reference__icontains: string;
}
