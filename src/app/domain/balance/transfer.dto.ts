import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { BalanceType } from '../../../model/utils/enum';
import { EntityManager } from 'typeorm';

export class TransferBalanceDTO {
  @ApiProperty({
    enum: BalanceType,
    example: BalanceType.BANK,
    description: 'Source Balance Type to be decreased',
  })
  from: BalanceType;

  @ApiProperty({
    enum: BalanceType,
    example: BalanceType.CASH,
    description: 'Destination Balance Type to be increased',
  })
  to: BalanceType;

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
