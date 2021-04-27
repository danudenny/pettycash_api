import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportBalanceDTO {
	@ApiProperty({
		description: 'Branch ID',
		example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
	})
	@IsUUID()
	branchId: string;

	@ApiProperty({
		description: 'Branch Name',
		example: 'Tangerang Pinang',
	})
	branchName: string;

	@ApiProperty({
		description: 'Bank Amount',
		example: 2000000,
	})
	bankAmount: number;

	@ApiProperty({
		description: 'Cash Amount',
		example: 100000,
	})
	cashAmount: number;

	@ApiProperty({
		description: 'Total Amount (cash + bank)',
		example: 2100000,
	})
	totalAmount: number;

}
