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
    example: 20,
  })
  number: number;

  @ApiProperty({
    description: 'Total Amount',
    example: 2000000,
  })
  @IsOptional()
  total: number;
}
