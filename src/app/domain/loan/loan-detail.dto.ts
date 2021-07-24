import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import {
  DownPaymentType,
  LoanSourceType,
  LoanState,
} from '../../../model/utils/enum';
import { LoanPaymentDTO } from './loan-payment.dto';

export class LoanDetailDTO {
  @ApiProperty({
    description: 'Loan ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

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
    description: 'Source Document',
    example: '1008991',
  })
  sourceDocument: string;

  @ApiProperty({
    description: 'Loan Source Type',
    example: LoanSourceType.DP,
  })
  sourceType: LoanSourceType;

  @ApiProperty({
    description: 'Down Payment Type',
    example: DownPaymentType.REIMBURSEMENT,
  })
  downPaymentType: DownPaymentType;

  @ApiPropertyOptional({
    description: 'DownPayment Product ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  @IsOptional()
  downPaymentProductId?: string;

  @ApiPropertyOptional({
    description: 'DownPayment Product Name',
    example: 'Reimbursement HO',
  })
  downPaymentProductName?: string;

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
    description: 'Loan State',
    example: LoanState.PAID,
    enum: LoanState,
  })
  state: LoanState;

  @ApiProperty({
    description: 'Payments',
    type: [LoanPaymentDTO],
  })
  payments: LoanPaymentDTO[];
}
