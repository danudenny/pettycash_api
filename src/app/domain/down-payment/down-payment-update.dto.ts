import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DownPaymentPayType } from '../../../model/utils/enum';

export class UpdateDownPaymentDTO {
  @ApiPropertyOptional({
    description: 'Date',
    example: '2021-01-29T09:00:29.803Z',
  })
  transactionDate?: Date;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Employee ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Period ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  @IsOptional()
  periodId?: string;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Destination Place', example: 'Jakarta' })
  destinationPlace?: string;

  @ApiPropertyOptional({ description: 'Amount Down Payment', example: 20000 })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Payment Type',
    example: DownPaymentPayType.CASH,
    enum: DownPaymentPayType,
  })
  paymentType?: DownPaymentPayType;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Isi Description',
  })
  description?: string;
}
