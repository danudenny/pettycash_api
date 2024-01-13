import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DownPaymentPayType } from '../../../model/utils/enum';

export class CreateDownPaymentDTO {
  @ApiProperty({ description: 'Date', example: '2021-01-29T09:00:29.803Z' })
  transactionDate: Date;

  @ApiProperty({
    description: 'Department ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  departmentId: string;

  @ApiProperty({
    description: 'Employee ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: 'Period ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  periodId: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Destination Place', example: 'Jakarta' })
  destinationPlace?: string;

  @ApiProperty({ description: 'Amount Down Payment', example: 20000 })
  amount: number;

  @ApiProperty({
    description: 'Payment Type',
    example: DownPaymentPayType.CASH,
    enum: DownPaymentPayType,
  })
  paymentType: DownPaymentPayType;

  @ApiProperty({ description: 'Description', example: 'Isi Description' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Number',
    example: 'DP202002AAB112',
  })
  @IsOptional()
  number?: string;
}
