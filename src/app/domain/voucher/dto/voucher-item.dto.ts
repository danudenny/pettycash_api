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

