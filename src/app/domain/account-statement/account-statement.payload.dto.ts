import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatementType } from '../../../model/utils/enum';
import { IsOptional } from 'class-validator';

export class QueryAccountStatementDTO extends BasePayload {
  @ApiPropertyOptional({
    example: '-transactionDate',
    description:
      'Sort of field, `^` for Ascendent and `-` for Descendent, e.g: `-transactionDate`',
  })
  @IsOptional()
  order: string;

  @ApiPropertyOptional({
    description: 'Start Date',
    example: '2021-01-01',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'End Date',
    example: '2021-12-31',
  })
  endDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  branchId: string;

  @ApiPropertyOptional({
    description: 'Transaction Type',
    example: AccountStatementType.BANK,
    enum: AccountStatementType,
  })
  type: AccountStatementType;

  @ApiPropertyOptional({
    example: false,
    description: 'Use to filter only DownPayment records.',
  })
  isDownPayment?: boolean;
}
