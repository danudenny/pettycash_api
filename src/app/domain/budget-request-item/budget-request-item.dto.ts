import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class BudgetRequestItemDTO {
  @ApiProperty({
    description: 'Budget ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Budget Reqeuest ID',
    example: '46dc5599-43f0-4569-b5f0-33e25f4cd29c',
  })
  @IsUUID()
  budgetRequestId: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'd786c337-39b5-40ab-952b-48cd186027bd',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Product Name',
    example: 'Bensin',
  })
  productName: string;

  @ApiProperty({
    description: 'Product Code',
    example: 'PRD202003AAA111',
  })
  productCode: string;

  @ApiProperty({
    description: 'Budget Item Description',
    example: 'Kebutuhan Pickup',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Budget Item Amount',
    example: 1000000.0,
  })
  @IsOptional()
  amount: number;
}

export class FindBudgetRequestItemIdParams {
  @IsUUID()
  budgetRequestId: string;
}
