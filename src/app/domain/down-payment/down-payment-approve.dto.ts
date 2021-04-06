import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { DownPaymentPayType } from '../../../model/utils/enum';

export class ApproveDownPaymentDTO {
  @ApiPropertyOptional({ description: 'Amount Down Payment', example: 20000 })
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Payment Type',
    example: DownPaymentPayType.CASH,
    enum: DownPaymentPayType,
  })
  @IsOptional()
  paymentType?: DownPaymentPayType;
}
