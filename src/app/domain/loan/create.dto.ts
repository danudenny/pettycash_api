import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { LoanType } from '../../../model/utils/enum';

export class CreateLoanDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: '28786cd1-bb9e-4926-a332-3a2e1c302e68',
  })
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({
    description: 'Loan Number',
    example: 'LOAN202002AAB112',
  })
  @IsOptional()
  number: string;

  @ApiPropertyOptional({
    description: 'Source Document',
    example: 'EXPENSE 001',
  })
  @IsOptional()
  sourceDocument?: string;

  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-03-15',
  })
  @IsISO8601({ strict: false })
  transactionDate: Date;

  @ApiProperty({
    description: 'Period ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  periodId: string;

  @ApiProperty({
    description: 'Employee ID',
    example: '84ada2dd-5750-479b-ae54-7edd81dfe35c',
  })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: 'Amount',
    example: 25000,
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Loan Type: `payable` = hutang, `receivable` = piutang.',
    example: LoanType.PAYABLE,
    enum: LoanType,
  })
  type: LoanType;
}
