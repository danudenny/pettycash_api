import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { JournalState } from '../../../model/utils/enum';
import { BasePayload } from '../common/base-payload.dto';

export class QueryJournalDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Journal Start Date',
    example: '2021-01-01',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'Journal End Date',
    example: '2021-12-31',
  })
  endDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsUUID()
  @IsOptional()
  branchId: string;

  @ApiPropertyOptional({
    description: 'Journal State',
    example: JournalState.DRAFT,
    enum: JournalState,
  })
  state: JournalState;

  @ApiPropertyOptional({
    description: 'Partner Name to search',
    example: 'HR Sicepat',
  })
  partner__icontains: string;

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
