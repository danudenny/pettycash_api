import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBudgetRequestItemDTO {
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

export class UpdateBudgetRequestItemDTO {
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
