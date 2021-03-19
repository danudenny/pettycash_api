import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BalanceDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Tangerang Pinang',
  })
  branchName: string;

  @ApiProperty({
    description: 'Current Amount',
    example: 2000000,
  })
  currentAmount: number;

  @ApiProperty({
    description: 'Minimum Amount',
    example: 2300000,
  })
  minimumAmount: number;

  @ApiProperty({
    description: 'Budget Amount',
    example: 8000000,
  })
  budgetAmount: number;

  @ApiProperty({
    description: 'Difference Amount',
    example: 300000,
  })
  differenceAmount: number;

  @ApiProperty({
    description: 'Balance State to Difference Amount',
    example: 'lessThan',
    enum: ['lessThan', 'equal', 'moreThan'],
  })
  state: string;
}
