import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ExpenseItemAttributeDTO } from './expense-item-attribute.dto';

export class ExpenseItemDTO {
  @ApiProperty({
    description: 'Item ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Product Name',
    example: 'Parkir',
  })
  productName: string;

  @ApiProperty({
    description: 'Product Code',
    example: 'PRD202003AAA111',
  })
  productCode: string;

  @ApiProperty({
    description: 'Description',
    example: 'Parkir 1 malam',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Amount',
    example: 25000,
  })
  amount: number;

  @ApiProperty({
    description: 'PIC HO Amount',
    example: 25000,
  })
  picHoAmount: number;

  @ApiProperty({
    description: 'SS HO Amount',
    example: 25000,
  })
  ssHoAmount: number;

  @ApiProperty({
    description: 'Checked Note',
    example: 'OK',
  })
  checkedNote: string;

  @ApiProperty({
    description: 'Item Attributes',
    type: [ExpenseItemAttributeDTO],
  })
  @IsOptional()
  @IsArray()
  atrributes: ExpenseItemAttributeDTO[];
}
