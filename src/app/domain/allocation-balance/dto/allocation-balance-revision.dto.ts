import { ApiProperty } from '@nestjs/swagger';

export class RevisionAllocationBalanceDTO {
	@ApiProperty({
		description: 'Number Reference',
		example: 'RVS-CBA202103QWERTY',
	})
	number: string

	@ApiProperty({
		description: 'Branch ID',
		example: '28786cd1-bb9e-4926-a332-3a2e1c302e68',
	})
	branchId: string

	@ApiProperty({
		description: 'Branch Name',
		example: 'Medan',
	})
	branchName: string

	@ApiProperty({
		description: 'Responsible User ID',
		example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
	})
	responsibleUserId: string

	@ApiProperty({
		description: 'Responsible User Name',
		example: 'Adry',
	})
	responsibleUserName: string

	@ApiProperty({
		description: 'Created Date',
		example: '2021-03-24 10:51:37',
	})
	createdDate: Date

	@ApiProperty({
		description: 'Transferred Date',
		example: '2021-03-24',
	})
	transferDate: Date

	@ApiProperty({
		description: 'Transfer Amount',
		example: 2000000,
	})
	amount: number

	@ApiProperty({
		description: 'Destination Bank ID',
		example: '28786cd1-bb9e-4926-a332-3a2e1c302e68',
	})
	destinationBankId: string

	@ApiProperty({
		description: 'Description',
		example: 'This is Not Mandatory field',
	})
	description: string

}
