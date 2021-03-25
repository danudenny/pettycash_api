import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CashBalanceAllocationState } from '../../../model/utils/enum';

export class AllocationBalanceDTO {
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
    description: 'Reference Number',
    example: 'ASK/2021/03/21/QWER123',
  })
  number: string;

  @ApiProperty({
    description: 'Allocation Balance Amount',
    example: 2000000,
  })
  amount: number;

  @ApiProperty({
    description: 'Responsible User Id',
    example: '8fed518e-aff2-4ef9-9d6e-562bdc2d8bdd',
  })
  @IsUUID()
  responsibleUserId: string;

  @ApiProperty({
    description: 'Responsible User Name',
    example: 'Admin Branch',
  })
  picName: string;

  @ApiProperty({
    description: 'Responsible User NIK',
    example: '20090134',
  })
  nik: string;

  @ApiProperty({
    description: 'Allocation Balance State',
    example: CashBalanceAllocationState.DRAFT,
    enum: CashBalanceAllocationState,
  })
  state: CashBalanceAllocationState;

  @ApiProperty({
    description: 'Received Date',
    example: '2021-03-11',
  })
  receivedDate: Date;

  @ApiProperty({
    description: 'Received User Id',
    example: null,
  })
  @IsUUID()
  receivedUserId: string;

  @ApiProperty({
    description: 'Received User Name',
    example: null,
  })
  receivedUserName: string;
}

export class RejectAllocationDTO {
  @ApiPropertyOptional({
    description: 'Rejection Note',
    example: 'Alokasi tidak bisa diterima karena ...',
  })
  @IsOptional()
  rejectedNote?: string;
}
