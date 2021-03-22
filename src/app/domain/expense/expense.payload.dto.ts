import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseState, ExpenseType } from '../../../model/utils/enum';

export class QueryExpenseDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Expense Start Date',
    example: '2021-01-01',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'Expense End Date',
    example: '2021-12-31',
  })
  endDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  branchId: string;

  @ApiPropertyOptional({
    description: 'Expense Type',
    example: 'expense',
    enum: ExpenseType,
  })
  type: ExpenseType;

  @ApiPropertyOptional({
    description: 'Expense Amount Min',
    example: 100000,
  })
  totalAmount__gte: number;

  @ApiPropertyOptional({
    description: 'Expense Amount Max',
    example: 900000,
  })
  totalAmount__lte: string;

  @ApiPropertyOptional({
    description: 'Expense State',
    example: ExpenseState.UNAPROVED,
    enum: ExpenseState,
  })
  state: ExpenseState;

  @ApiPropertyOptional({
    description: 'Down Payment Number',
    example: 'UM0002',
  })
  downPaymentNumber__icontains: string;

  @ApiPropertyOptional({
    description: 'Expense Number',
    example: 'REL-2020/01/AAB112',
  })
  number__icontains: string;
}
