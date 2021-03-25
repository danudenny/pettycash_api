import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import {
  AccountStatementAmountPosition,
  AccountStatementType,
} from '../../../model/utils/enum';

export class AccountStatementDTO {
  @ApiProperty({
    description: 'AccountStatement ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-01-27',
  })
  transactionDate: Date;

  @ApiProperty({
    description: 'Branch ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Branch Code',
    example: '1890009',
  })
  branchCode: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  branchName: string;

  @ApiProperty({
    description: 'Transaction Type',
    example: AccountStatementType.BANK,
    enum: AccountStatementType,
  })
  type: AccountStatementType;

  @ApiProperty({
    description: 'Reference',
    example: 'MUT202001AAB112',
  })
  reference: string;

  @ApiProperty({
    description: 'Update User NIK',
    example: '200899111',
  })
  updateUserNik: string;

  @ApiProperty({
    description: 'Update User First Name',
    example: 'Arianti',
  })
  updateUserFirstName: string;

  @ApiProperty({
    description: 'Update User Last Name',
    example: 'Silvia',
  })
  updateUserLastName: string;

  @ApiProperty({
    description: 'Amount',
    example: 900000,
  })
  amount: number;

  @ApiProperty({
    description: 'Amount Posisition',
    example: AccountStatementAmountPosition.DEBIT,
    enum: AccountStatementAmountPosition,
  })
  amountPosition: AccountStatementAmountPosition;
}
