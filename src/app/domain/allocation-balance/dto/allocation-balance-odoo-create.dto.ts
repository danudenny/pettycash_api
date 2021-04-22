import { ApiProperty } from '@nestjs/swagger';

export class CreateAllocationBalanceOdooDTO {
	@ApiProperty({
		description: 'Auth Key',
		example: '2ee2cec3302e26b8030b233d614c4f4e'
	})
	authKey: string;

	@ApiProperty({
		description: 'Number Reference',
		example: 'CBA202102ABC123'
	})
	number: string;

	@ApiProperty({
		description: 'Analytic Account',
		example: '1201001'
	})
	analyticAccount: string;

	@ApiProperty({
		description: 'Branch Name',
		example: 'Tangerang Pinang'
	})
	branchName: string;

	@ApiProperty({
		description: 'Amount',
		example: 25000
	})
	amount: number;

	@ApiProperty({
		description: 'Nomor Rekening',
		example: '5350205308'
	})
	accountNumber: string;

	@ApiProperty({
		description: 'Description',
		example: '[Biaya] Dana Transit Kas Testing'
	})
	description?: string;
}
