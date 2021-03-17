import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { LoanState, LoanType } from '../../../model/utils/enum';

export class LoanDTO {
  @ApiProperty({
    description: 'Loan ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-03-27',
  })
  transactionDate: Date;

  @ApiProperty({
    description: 'Loan Period Month',
    example: 1,
  })
  periodMonth: number;

  @ApiProperty({
    description: 'Loan Period Year',
    example: 2021,
  })
  periodYear: number;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  branchName: string;

  @ApiProperty({
    description: 'Branch Code',
    example: '1008991',
  })
  branchCode: string;

  @ApiProperty({
    description: 'Loan Number',
    example: 'LOAN202003111AAA',
  })
  number: string;

  @ApiProperty({
    description: 'Source Document',
    example: '1008991',
  })
  sourceDocument: string;

  @ApiProperty({
    description: 'Employee Name',
    example: 'Arianty Silvia',
  })
  employeeName: string;

  @ApiProperty({
    description: 'Employee NIK',
    example: '2020081991',
  })
  employeeNik: string;

  @ApiProperty({
    description: 'Loan Type: `payable` = `hutang`. `receivable` = `piutang`',
    example: LoanType.PAYABLE,
    enum: LoanType,
  })
  type: LoanType;

  @ApiProperty({
    description: 'Loan State',
    example: LoanState.PAID,
    enum: LoanState,
  })
  state: LoanState;

  @ApiProperty({
    description: 'Loan Amount',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Residual Amount (sisa pinjaman)',
    example: 40000,
  })
  residualAmount: number;

  @ApiProperty({
    description: 'Paid Amount (pinjam dibayar)',
    example: 10000,
  })
  paidAmount: number;
}
