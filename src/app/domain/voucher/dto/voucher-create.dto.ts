import { CreateVoucherItemDTO } from './voucher-item.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray } from 'class-validator';
import { VoucherPaymentType } from '../../../../model/utils/enum';

export class VoucherCreateDTO {
  @ApiProperty({
    description: 'Voucher Number',
    example: 'VCRM202106ABC123',
  })
  number: string;

  @ApiProperty({
    description: 'Employee ID',
    example: '0c601cd2-735d-48ff-9f24-ce841ea7f5d1',
  })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: 'Check In Time',
    example: '2021-04-30 08:03:31',
  })
  checkinTime: Date;

  @ApiProperty({
    description: 'Voucher Payment Type',
    example: VoucherPaymentType.CASH,
  })
  payment_type: VoucherPaymentType;

  @ApiProperty({
    description: 'Total Amount',
    example: 100000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Voucher Items',
    type: [CreateVoucherItemDTO],
  })
  @IsArray()
  items: CreateVoucherItemDTO[];
}

export class BatchPayloadVoucherDataDTO {
  @ApiProperty({
    description: 'Voucher ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  voucher_ids: string;
}

export class BatchPayloadVoucherDTO {
  @ApiProperty({
    example: [
      'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
      '35eefc37-3500-40b1-9d7e-d3352474958f',
    ],
  })
  voucher_ids: string[];

  @ApiProperty({
    example: 'bank',
  })
  payment_type: VoucherPaymentType;
}
