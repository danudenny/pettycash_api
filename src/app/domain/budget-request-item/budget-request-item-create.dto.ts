import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

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
    description: 'Budget Request Item ID',
    example: '46dc5599-43f0-4569-b5f0-33e25f4cd29c',
  })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'd786c337-39b5-40ab-952b-48cd186027bd',
  })
  @IsUUID()
  @IsOptional()
  productId: string;

  @ApiProperty({
    description: 'Budget Request Item Description',
    example: 'Kebutuhan Pickup',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Budget Request Item Amount',
    example: 1000000.0,
  })
  @IsOptional()
  amount: number;

  @ApiProperty({
    description: 'Budget Item Status Is Deleted',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDeleted: boolean;
}
