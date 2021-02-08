import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsUUID } from 'class-validator';

export class ProductDTO {
  @ApiProperty({
    description: 'Product ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Product Code',
    example: 'PR00001',
  })
  code: string;

  @ApiProperty({
    description: 'Product Name',
    example: 'Tiket Pesawat',
  })
  name: string;

  @ApiProperty({
    description: 'Product Description',
    example: 'Tiket pesawat untuk perjalanan dinas',
  })
  description: string;

  @ApiProperty({
    description: 'Describe the product if has tax or not',
    example: true,
  })
  isHasTax: boolean;

  @ApiProperty({
    description: 'Amount of products',
    example: 750000.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Coa of product',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  coaId: string;

  @ApiProperty({
    description: 'Describe the product if active or not',
    example: true,
  })
  isActive: boolean;
}
