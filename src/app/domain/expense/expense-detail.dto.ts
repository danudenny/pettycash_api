import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import {
  ExpensePaymentType,
  ExpenseState,
  ExpenseType,
} from '../../../model/utils/enum';
import { ExpenseItemDTO } from './expense-item.dto';
import { ExpenseHistoryDTO } from './expense-history.dto';

export class ExpenseDetailDTO {
  @ApiProperty({
    description: 'Expense ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Expense Name',
    example: '2021-01-27',
  })
  transactionDate: Date;

  @ApiProperty({
    description: 'Expense Period Id',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  periodId: string;

  @ApiProperty({
    description: 'Expense Period Month',
    example: 1,
  })
  periodMonth: number;

  @ApiProperty({
    description: 'Expense Period Year',
    example: 2021,
  })
  periodYear: number;

  @ApiProperty({
    description: 'Expense Number',
    example: 'REL-2020/01/AAB112',
  })
  number: string;

  @ApiProperty({
    description: 'Partner Id',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  partnerId: string;

  @ApiProperty({
    description: 'Partner Name',
    example: 'PT. Indah Sekali',
  })
  partnerName: string;

  @ApiProperty({
    description: 'Source Document',
    example: 'SRC-DOC - 001',
  })
  sourceDocument: string;

  @ApiProperty({
    description: 'Expense Number',
    example: 900000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Down Payment Amount',
    example: 0,
  })
  downPaymentAmount: number;

  @ApiProperty({
    description: 'Difference Amount',
    example: 0,
  })
  differenceAmount: number;

  @ApiProperty({
    description: 'Down Payment Id',
    example: '5eab29b9-d6e0-4f34-bcac-185e4381d7e0',
  })
  downPaymentId: string;

  @ApiProperty({
    description: 'Down Payment Number',
    example: 'DP202003AAA111',
  })
  downPaymentNumber: string;

  @ApiProperty({
    description: 'Expense Type',
    example: ExpenseType.EXPENSE,
    enum: ExpenseType,
  })
  type: ExpenseType;

  @ApiProperty({
    description: 'Expense Payment Type',
    example: ExpensePaymentType.BANK,
    enum: ExpensePaymentType,
  })
  paymentType: ExpensePaymentType;

  @ApiProperty({
    description: 'Expense State',
    example: ExpenseState.DRAFT,
    enum: ExpenseState,
  })
  state: ExpenseState;

  @ApiProperty({
    description: 'Expense Items',
    type: [ExpenseItemDTO],
  })
  @IsArray()
  items: ExpenseItemDTO[];

  @ApiProperty({
    description: 'Expense Histories',
    type: [ExpenseHistoryDTO],
  })
  @IsArray()
  histories: ExpenseHistoryDTO[];
}
