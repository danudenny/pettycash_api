import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateAccountCashboxItemsDTO {
  @ApiProperty({
    description: 'Pieces (Denom)',
    example: 100000,
  })
  pieces: number;

  @ApiProperty({
    description: 'Number of Pieces',
    example: 5,
  })
  number: number;

  @ApiProperty({
    description: 'Total Amount',
    example: 500000,
  })
  @IsOptional()
  total: number;
}
