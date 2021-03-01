import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

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
    example: 'Tiket Pesawat'
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
    example: 'bc598bc8-aefd-44f1-92cf-2a3a0f1f2750',
  })
  coaId: string;

  @ApiProperty({
    description: 'Coa code',
    example: '500.10.11',
  })
  coaCode: string;

  @ApiProperty({
    description: 'Coa Name',
    example: 'Cash Transit Coa',
  })
  coaName: string;

  @ApiProperty({
    description: 'Describe the product if active or not',
    example: true,
  })
  isActive: boolean;
}
