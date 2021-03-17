import { ApiProperty } from '@nestjs/swagger';
import { AccountPaymentPayMethod } from '../../../model/utils/enum';

export class CreatePaymentLoanDTO {
  @ApiProperty({
    description: 'Payment Method: `cash` or `bank`.',
    example: AccountPaymentPayMethod.BANK,
    enum: AccountPaymentPayMethod,
  })
  paymentMethod: AccountPaymentPayMethod;

  @ApiProperty({
    description: 'Amount to pay',
    example: 50000,
  })
  amount: number;
}
