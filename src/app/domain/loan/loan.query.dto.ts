import { ApiPropertyOptional } from '@nestjs/swagger';
import { LoanState, LoanType } from '../../../model/utils/enum';
import { BasePayload } from '../common/base-payload.dto';

export class QueryLoanDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Loan Start Date',
    example: '2021-01-01',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'Loan End Date',
    example: '2021-12-31',
  })
  endDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Loan Number',
    example: 'LOAN202003AA111',
  })
  number__icontains: string;

  @ApiPropertyOptional({
    description: 'Source Document',
    example: 'REL202003001AAA999',
  })
  sourceDocument__icontains: string;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  branchId: string;

  @ApiPropertyOptional({
    description: 'Loan State',
    example: LoanState.PAID,
    enum: LoanState,
  })
  state: LoanState;

  @ApiPropertyOptional({
    description: 'Loan Type: `payable` = `hutang`. `receivable` = `piutang`',
    example: LoanType.PAYABLE,
    enum: LoanType,
  })
  type: LoanType;

  @ApiPropertyOptional({
    description: 'Employee ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  employeeId: string;
}
