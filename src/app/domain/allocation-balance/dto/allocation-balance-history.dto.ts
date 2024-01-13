import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CashBalanceAllocationState, MASTER_ROLES } from '../../../../model/utils/enum';

export class AlocationBalanceHistoryDTO {
  @ApiProperty({
    description: 'History ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'User Full Name',
    example: 'Jenny Safitri',
  })
  userFullName: string;

  @ApiProperty({
    description: 'User Role',
    example: MASTER_ROLES.PIC_HO,
  })
  userRole: MASTER_ROLES;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  branchName: string;

  @ApiProperty({
    description: 'Expense State',
    example: CashBalanceAllocationState.DRAFT,
  })
  state: CashBalanceAllocationState;

  @ApiProperty({
    description: 'Rejected Note',
    example: 'Not OK',
  })
  rejectedNote: string;

  @ApiProperty({
    description: 'CreatedAt',
  })
  createdAt: Date;
}
