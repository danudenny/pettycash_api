import { ApiProperty } from '@nestjs/swagger';
import { VoucherState } from '../../../../model/utils/enum';
import { IsArray, IsObject } from 'class-validator';
import { CreateVoucherItemDTO } from './voucher-item.dto';

export class CreateVoucherDTO {
	@ApiProperty({
		description: 'Branch ID',
		example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
	})
	branchId: string;

	@ApiProperty({
		description: 'Voucher Number`',
		example: 'VCR202102ABC123',
	})
	number: string;

	@ApiProperty({
		description: 'Transaction Date',
		example: '2021-04-08',
	})
	transactionDate: Date;

	@ApiProperty({
		description: 'Employee ID',
		example: 'cd5f53f0-a2ba-4b2d-8119-8e0a6247d37e',
	})
	employeeId: string;

	@ApiProperty({
		description: 'Employee Position',
		example: 'Driver',
	})
	employeePosition?: string;

	@ApiProperty({
		description: 'Check In Time',
		example: '2021-04-06 12:56:54',
	})
	checkinTime: Date;

	@ApiProperty({
		description: 'Check Out Time',
		example: '2021-04-07 04:21:02',
	})
	checkoutTime: Date;

	@ApiProperty({
		description: 'Voucher Total Amount',
		example: 30000,
	})
	totalAmount: number;

	@ApiProperty({
		description: 'Voucher is Realized',
		example: 'true',
		default: () => 'true',
	})
	isRealized: boolean;

	@ApiProperty({
		description: 'Voucher State',
		example: VoucherState.DRAFT,
		default: VoucherState.DRAFT,
	})
	state: VoucherState;

	@ApiProperty({
		description: 'Voucher Items',
		type: [CreateVoucherItemDTO],
	})
	items: CreateVoucherItemDTO[];
}
