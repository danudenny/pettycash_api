import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { JournalState } from '../../../model/utils/enum';
import { JournalItemDTO } from './journal-item.dto';

export class JournalDTO {
  @ApiProperty({
    description: 'Journal ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Reversal Journal ID',
    example: 'e92f3424-9aef-4ed0-a591-e521df4af763',
  })
  @IsUUID()
  reverseJournalId: string;

  @ApiProperty({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  branchName: string;

  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-01-27',
  })
  transactionDate: Date;

  @ApiProperty({
    description: 'Period Month',
    example: 1,
  })
  periodMonth: number;

  @ApiProperty({
    description: 'Period Year',
    example: 2021,
  })
  periodYear: number;

  @ApiProperty({
    description: 'Journal Number',
    example: 'JRNL20200201AAA123',
  })
  number: string;

  @ApiProperty({
    description: 'Journal Reference',
    example: 'REF DOC 001',
  })
  reference: string;

  @ApiProperty({
    description: 'Journal Sync Fail Reason',
    example: 'Branch Not Found',
  })
  syncFailReason: string;

  @ApiProperty({
    description: 'Partner Name',
    example: 'HR Sicepat',
  })
  partnerName: string;

  @ApiProperty({
    description: 'Partner Code',
    example: 'PRTN202003AAA999',
  })
  partnerCode: string;

  @ApiProperty({
    description: 'Total Amount',
    example: 900000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Journal State',
    example: JournalState.DRAFT,
    enum: JournalState,
  })
  state: JournalState;

  @ApiProperty({
    description: 'Journal Items',
    type: [JournalItemDTO],
  })
  @IsArray()
  items: JournalItemDTO[];
}
