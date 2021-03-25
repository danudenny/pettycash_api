import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetRequestState } from '../../../model/utils/enum';

export class QueryBudgetRequestDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Budget Start Date',
    example: '2021-01-29T09:00:29.803Z',
  })
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Budget End Date',
    example: '2021-01-30T09:00:29.803Z',
  })
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Branch Id',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  branchId: string;

  @ApiPropertyOptional({
    description: 'Minimum Range Total Amount',
    example: 1000000.0,
  })
  minAmount: number;

  @ApiPropertyOptional({
    description: 'Maximum Range Total Amount',
    example: 5000000.0,
  })
  maxAmount: number;

  @ApiPropertyOptional({
    description: 'Budget State',
    example: BudgetRequestState.DRAFT,
    enum: BudgetRequestState,
  })
  state: BudgetRequestState;

  @ApiPropertyOptional({
    description: 'Budget Number',
    example: 'BG001',
  })
  number__icontains: string;
}
