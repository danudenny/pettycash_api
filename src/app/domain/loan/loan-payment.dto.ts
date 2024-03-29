import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import {
  AccountPaymentPayMethod,
  AccountPaymentState,
  AccountPaymentType,
} from '../../../model/utils/enum';

export class LoanPaymentDTO {
  @ApiProperty({
    description: 'Payment ID',
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
    description: 'Loan Amount',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Receiver Name',
    example: 'Arianty Silvia',
  })
  receiverName: string;

  @ApiProperty({
    description: 'Receiver NIK',
    example: '2020081991',
  })
  receiverNik: string;

  @ApiProperty({
    description: 'Payment Type: `partially` or `full`',
    example: AccountPaymentType.PARTIALLY,
    enum: AccountPaymentType,
  })
  type: AccountPaymentType;

  @ApiProperty({
    description: 'Payment Method: `bank` or `cash`',
    example: AccountPaymentPayMethod.BANK,
    enum: AccountPaymentPayMethod,
  })
  paymentMethod: AccountPaymentPayMethod;

  @ApiProperty({
    description: 'Payment State: `paid` or `reversed`',
    example: AccountPaymentState.PAID,
    enum: AccountPaymentState,
  })
  state: AccountPaymentState;
}
