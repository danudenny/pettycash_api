import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { BudgetState } from '../../../model/utils/enum';

export class CreateBudgetItemDTO {
  @ApiProperty({
    description: 'Budget ID',
    example: '46dc5599-43f0-4569-b5f0-33e25f4cd29c',
  })
  @IsUUID()
  budgetId: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'd786c337-39b5-40ab-952b-48cd186027bd',
  })
  @IsUUID()
  productId: string;

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

export class UpdateBudgetItemDTO {
  @ApiProperty({
    description: 'Budget ID',
    example: '46dc5599-43f0-4569-b5f0-33e25f4cd29c',
  })
  @IsUUID()
  budgetId: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'd786c337-39b5-40ab-952b-48cd186027bd',
  })
  @IsUUID()
  productId: string;

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
