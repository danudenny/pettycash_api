import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { BalanceType } from '../../../model/utils/enum';
import { EntityManager } from 'typeorm';

export class CreateBalanceDTO {
  @ApiProperty({
    enum: BalanceType,
    example: BalanceType.BANK,
    description: 'Balance Type to update',
  })
  type: BalanceType;

  @ApiProperty({
    description: 'Amount to update',
    example: 10000,
  })
  amount: number;

  @ApiProperty({
    description: 'Branch ID to update',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({
    description: 'TypeORM EntityManager',
  })
  manager?: EntityManager;
}
