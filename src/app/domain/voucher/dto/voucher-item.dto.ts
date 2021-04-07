import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class VoucherItemDTO {
	@ApiPropertyOptional({
		description: 'Voucher Item ID',
		example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
	})
	@IsUUID()
	id: string;

	@ApiPropertyOptional({
		description: 'Voucher ID',
		example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
	})
	@IsUUID()
	voucherId: string;

	@ApiPropertyOptional({
		description: 'Product ID',
		example: '715da6a2-e709-4a72-b37f-f189bec36a53',
	})
	@IsUUID()
	productId: string;

	@ApiPropertyOptional({
		description: 'Product Name',
		example: 'Uang Bensin',
	})
	@IsUUID()
	productName: string;

	@ApiPropertyOptional({
		description: 'Amount',
		example: 35000,
	})
	@IsUUID()
	amount: number;
}
