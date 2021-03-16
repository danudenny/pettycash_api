import { Binary } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class ExpenseItemAttributeDTO {
  @ApiProperty({
    description: 'Key',
    example: 'vehicleNumber',
  })
  key: string;

  @ApiProperty({
    description: 'Value',
    example: 'B-1234-VKG',
  })
  value: string;
}

export class CreateExpenseItemDTO {
  @ApiProperty({
    description: 'Product ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Parkir',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Amount',
    example: 25000,
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Item Attributes',
    type: [ExpenseItemAttributeDTO],
  })
  @IsOptional()
  @IsArray()
  atrributes: ExpenseItemAttributeDTO[];
}
