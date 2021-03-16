import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ExpenseState, ExpenseType } from '../../../model/utils/enum';
import { ExpenseItem } from '../../../model/expense-item.entity';
import { Product } from '../../../model/product.entity';

export class ExpenseDTO {
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
    description: 'Expense Period Month',
    example: 1,
  })
  periodMonth: Number;

  @ApiProperty({
    description: 'Expense Period Year',
    example: 2021,
  })
  periodYear: Number;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  branchName: string;

  @ApiProperty({
    description: 'Expense Type',
    example: 'expense',
    enum: ExpenseType,
  })
  type: ExpenseType;

  @ApiProperty({
    description: 'Expense Down Payment ID',
    example: null,
  })
  downPaymentId: string;

  @ApiProperty({
    description: 'Expense Down Payment Number',
    example: null,
  })
  downPaymentNumber: string;

  @ApiProperty({
    description: 'Expense Number',
    example: 'REL-2020/01/AAB112',
  })
  number: string;

  @ApiProperty({
    description: 'Expense Number',
    example: 900000,
  })
  totalAmount: Number;

  @ApiProperty({
    description: 'Expense State',
    example: 'draft',
    enum: ExpenseState,
  })
  state: ExpenseState;
}

export class ExpenseRelationDTO {
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
  })
  periodId: string;

  @ApiProperty({
    description: 'Expense Period Year',
    example: 2021,
  })
  periodYear: Number;
  //
  // @ApiProperty({
  //   description: 'Branch Name',
  //   example: 'Kebon Jeruk',
  // })
  // branchName: string;

  @ApiProperty({
    description: 'Expense Type',
    example: 'expense',
    enum: ExpenseType,
  })
  type: ExpenseType;

  // @ApiProperty({
  //   description: 'Expense Down Payment ID',
  //   example: null,
  // })
  // downPaymentId: string;

  // @ApiProperty({
  //   description: 'Expense Down Payment Number',
  //   example: null,
  // })
  // downPaymentNumber: string;

  @ApiProperty({
    description: 'Expense Number',
    example: 'REL-2020/01/AAB112',
  })
  number: string;

  @ApiProperty({
    description: 'Expense Number',
    example: 900000,
  })
  totalAmount: Number;

  @ApiProperty({
    description: 'Expense State',
    example: 'draft',
    enum: ExpenseState,
  })
  state: ExpenseState;

  @ApiProperty()
  items: ExpenseItem[];
}


