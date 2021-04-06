import { ApiProperty } from '@nestjs/swagger';
import { DownPaymentPayType } from '../../../model/utils/enum';

export class ApproveDownPaymentDTO {
  @ApiProperty({ description: 'Amount Down Payment', example: 20000 })
  amount: number;

  @ApiProperty({
    description: 'Payment Type',
    example: DownPaymentPayType.CASH,
    enum: DownPaymentPayType,
  })
  paymentType: DownPaymentPayType;
}
