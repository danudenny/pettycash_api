import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { VoucherItemDTO } from './voucher-item.dto';

export class VoucherDetailDTO {
	@ApiProperty({
		description: 'Voucher Item ID',
		example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
	})
	@IsUUID()
	id: string;

	@ApiProperty( {
		description: 'Voucher Number',
		example: 'VCR202102ABC123'
	})
	number: string;

	@ApiProperty({
		description: 'Transaction Date',
		example: '2021-04-01'
	})
	transactionDate: Date;

	@ApiProperty( {
		description: 'Employee NIK',
		example: '202011839'
	})
	employeeNik: string

	@ApiProperty( {
		description: 'Employee Name',
		example: 'Kendall Puspita'
	})
	employeeName: string

	@ApiProperty({
		description: 'Employee Position',
		example: 'Driver'
	})
	employeePosition: string

	@ApiProperty({
		description: 'Branch Name',
		example: 'Medan' //Medan
	})
	@IsUUID()
	branchName: string;

	@ApiProperty( {
		description: 'Total Amount',
		example: 100000
	})
	totalAmount: number;

	@ApiProperty({
		description: 'Voucher Items',
		type: [VoucherItemDTO],
	})
	@IsArray()
	items: VoucherItemDTO[]
}
