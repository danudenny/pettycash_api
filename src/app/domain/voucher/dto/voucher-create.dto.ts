import { CreateVoucherItemDTO } from './voucher-item.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray } from 'class-validator';

export class VoucherCreateDTO {
	@ApiProperty( {
		description: 'Voucher Number',
		example: 'VCRM202106ABC123'
	})
	number: string;

	@ApiProperty({
		description: 'Transaction Date',
		example: '2021-04-01'
	})
	transactionDate: Date;

	@ApiProperty( {
		description: 'Employee ID',
		example: '0c601cd2-735d-48ff-9f24-ce841ea7f5d1'
	})
  @IsUUID()
	employeeId: string

	@ApiProperty({
		description: 'Branch ID',
		example: '7387e81d-e8fc-429d-929a-0b6bcd0ee729'
	})
	@IsUUID()
	branchId: string;

  @ApiProperty({
		description: 'Check In Time',
		example: '2021-04-30 08:03:31'
	})
	checkinTime: Date;

  @ApiProperty({
		description: 'Check Out Time',
		example: '2021-04-30 17:03:31'
	})
	checkoutTime: Date;

	@ApiProperty( {
		description: 'Total Amount',
		example: 100000
	})
	totalAmount: number;

	@ApiProperty({
		description: 'Voucher Items',
		type: [CreateVoucherItemDTO],
	})
	@IsArray()
	items: CreateVoucherItemDTO[]
}