import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetState } from '../../../model/utils/enum';

export class QueryBudgetDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Budget Start Date',
    example: '2021-01-01',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'Budget End Date',
    example: '2021-12-31',
  })
  endDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Branch Id',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  branchId: string;

  @ApiPropertyOptional({
    description: 'Minimum Range Total Amount',
    example: 1000000.0,
  })
  minAmount__gte: number;

  @ApiPropertyOptional({
    description: 'Maximum Range Total Amount',
    example: 5000000.0,
  })
  maxAmount__lte: number;

  @ApiPropertyOptional({
    description: 'Budget State',
    example: BudgetState.DRAFT,
    enum: BudgetState,
  })
  state: BudgetState;

  @ApiPropertyOptional({
    description: 'Budget Number',
    example: 'BG001',
  })
  number__icontains: string;
}
