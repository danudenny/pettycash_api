import { ApiProperty } from '@nestjs/swagger';

export class VoucherItemDTO {
	@ApiProperty({
		description: 'Product Name',
		example: 'Uang Bensin',
	})
	productName: string;

	@ApiProperty({
		description: 'Amount',
		example: 35000,
	})
	amount: number;
}

export class CreateVoucherItemDTO {
	@ApiProperty({
		description: 'Product Id',
		example: 'ce9ff0fe-0295-4aa1-8bd7-9eb1cd3bb26e',
	})
	productId: string;

	@ApiProperty({
		description: 'Amount',
		example: 25000,
	})
	amount: number;
}

