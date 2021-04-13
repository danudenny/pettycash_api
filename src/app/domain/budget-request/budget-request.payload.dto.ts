import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetRequestState } from '../../../model/utils/enum';

export class QueryBudgetRequestDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Budget Request Start Date',
    example: '2021-01-29',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'Budget  Request End Date',
    example: '2021-01-30',
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
    description: 'Budget Request State',
    example: BudgetRequestState.DRAFT,
    enum: BudgetRequestState,
  })
  state: BudgetRequestState;

  @ApiPropertyOptional({
    description: 'Budget Request Number',
    example: 'BGTR001',
  })
  number__icontains: string;
}
