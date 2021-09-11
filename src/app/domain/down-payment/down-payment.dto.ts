import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DownPaymentHistoryDTO } from './down-payment-history.dto';
import {
  DownPaymentPayType,
  DownPaymentState,
  DownPaymentType,
  LoanState,
  LoanType,
} from '../../../model/utils/enum';

export class DownPaymentDTO {
  @ApiProperty({
    description: 'Down Payment ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Type Down Payment',
    example: DownPaymentType.REIMBURSEMENT,
    enum: DownPaymentType,
  })
  type: DownPaymentType;

  @ApiProperty({ description: 'Number Down Payment', example: 'UM001' })
  number: string;

  @ApiProperty({ description: 'Amount Down Payment', example: 20000 })
  amount: number;

  @ApiProperty({
    description: 'Payment Type',
    example: DownPaymentPayType.CASH,
    enum: DownPaymentPayType,
  })
  paymentType: DownPaymentPayType;

  @ApiProperty({
    description: 'Branch ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Expense ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  expenseId: string;

  @ApiProperty({ description: 'Branch Name', example: 'Kebun Jeruk' })
  branchName: string;

  @ApiProperty({
    description: 'Department ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ description: 'Department Name', example: 'IT' })
  departmentName: string;

  @ApiProperty({ description: 'Departement isActive', example: 'true' })
  departmentIsActive: string;

  @ApiProperty({
    description: 'Employee ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Employee Name', example: 'Jeny' })
  employeeName: string;

  @ApiProperty({ description: 'Employee Nik', example: '998736762732172' })
  employeeNik: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Product Name', example: 'Uang Bensin' })
  productName: string;

  @ApiProperty({
    description: 'Period ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  periodId: string;

  @ApiProperty({ description: 'Period Name', example: '01-2020' })
  periodName: string;

  @ApiProperty({ description: 'Description', example: 'Isi Description' })
  description?: string;

  @ApiProperty({ description: 'Destination Place', example: 'Jakarta' })
  destinationPlace?: string;

  @ApiProperty({
    description: 'State',
    example: DownPaymentState.DRAFT,
    enum: DownPaymentState,
  })
  state: DownPaymentState;

  @ApiProperty({ description: 'Realized', example: false })
  isRealized: boolean;

  @ApiProperty({ description: 'Date', example: '2021-01-29T09:00:29.803Z' })
  transactionDate: Date;

  @ApiProperty({
    description: 'Loan ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  loanId: string;

  @ApiProperty({ description: 'Loan Number', example: 'LOAN202107ATY876' })
  loanNumber: string;

  @ApiProperty({
    description: 'Loan Type: `payable` = `hutang`. `receivable` = `piutang`',
    example: LoanType.PAYABLE,
    enum: LoanType,
  })
  loanType: LoanType;

  @ApiProperty({
    description: 'Paid Amount (pinjam dibayar)',
    example: 10000,
  })
  loanPaidAmount: number;

  @ApiProperty({
    description: 'Residual Amount (sisa pinjaman)',
    example: 40000,
  })
  loanResidualAmount: number;

  @ApiProperty({
    description: 'Loan State',
    example: LoanState.UNPAID,
    enum: LoanState,
  })
  loanState: LoanState;
}

export class ShowDownPaymentDTO {
  @ApiProperty({
    description: 'Down Payment ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Type Down Payment',
    example: 'reimbursement',
    enum: DownPaymentType,
  })
  type: DownPaymentType;

  @ApiProperty({ description: 'Number Down Payment', example: 'UM001' })
  number: string;

  @ApiProperty({ description: 'Amount Down Payment', example: 20000 })
  amount: number;

  @ApiProperty({
    description: 'Payment Type',
    example: 'cash',
    enum: DownPaymentPayType,
  })
  paymentType: DownPaymentPayType;

  @ApiProperty({
    description: 'Branch ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'Branch Name', example: 'Kebun Jeruk' })
  branchName: string;

  @ApiProperty({ description: 'Branch Code', example: '1101006' })
  branchCode: string;

  @ApiProperty({
    description: 'Department ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ description: 'Department Name', example: 'IT' })
  departmentName: string;

  @ApiProperty({
    description: 'Employee ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Employee Name', example: 'Jeny' })
  employeeName: string;

  @ApiProperty({ description: 'Employee Nik', example: '998736762732172' })
  employeeNik: string;

  @ApiProperty({
    description: 'Period ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  periodId: string;

  @ApiProperty({ description: 'Period Name', example: '01-2020' })
  periodName: string;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Product Name', example: 'Uang Bensin' })
  productName?: string;

  @ApiProperty({ description: 'Description', example: 'Isi Description' })
  description?: string;

  @ApiProperty({ description: 'Destination Place', example: 'Jakarta' })
  destinationPlace?: string;

  @ApiProperty({
    description: 'State',
    example: 'draf',
    enum: DownPaymentState,
  })
  state: DownPaymentState;

  @ApiProperty({ description: 'Realized', example: false })
  isRealized?: boolean;

  @ApiProperty({ description: 'Date', example: '2021-01-29T09:00:29.803Z' })
  transactionDate: Date;

  @ApiProperty({
    description: 'Loan ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  loanId: string;

  @ApiProperty({ description: 'Loan Number', example: 'LOAN202107ATY876' })
  loanNumber: string;

  @ApiProperty({
    description: 'Loan Type: `payable` = `hutang`. `receivable` = `piutang`',
    example: LoanType.PAYABLE,
    enum: LoanType,
  })
  loanType: LoanType;

  @ApiProperty({
    description: 'Paid Amount (pinjam dibayar)',
    example: 10000,
  })
  loanPaidAmount: number;

  @ApiProperty({
    description: 'Residual Amount (sisa pinjaman)',
    example: 40000,
  })
  loanResidualAmount: number;

  @ApiProperty({
    description: 'Loan State',
    example: LoanState.UNPAID,
    enum: LoanState,
  })
  loanState: LoanState;

  @ApiProperty({
    description: ' Down Payment Histories',
    type: [DownPaymentHistoryDTO],
  })
  @IsArray()
  histories: DownPaymentHistoryDTO[];
}
