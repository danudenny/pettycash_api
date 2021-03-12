import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ExpenseItemAttributeDTO } from './expense-item-attribute.dto';

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
