import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { JournalState } from '../../../model/utils/enum';

export class JournalDTO {
  @ApiProperty({
    description: 'Item ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  itemId: string;

  @ApiProperty({
    description: 'Journal ID',
    example: '007b2cae-fc1a-4385-a7be-768e6e607265',
  })
  @IsUUID()
  journalId: string;

  @ApiProperty({
    description: 'Reversal Journal ID',
    example: 'e92f3424-9aef-4ed0-a591-e521df4af763',
  })
  @IsUUID()
  reverseJournalId: string;

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
    description: 'DownPayment Number',
    example: 'UM/2020/12/XYZA1234',
  })
  downPaymentNumber: string;

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
    description: 'Journal Reference',
    example: 'REF DOC 001',
  })
  description: string;

  @ApiProperty({
    description: 'CoA ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  coaId: string;

  @ApiProperty({
    description: 'CoA Code',
    example: '500.001.009',
  })
  coaCode: string;

  @ApiProperty({
    description: 'CoA Name',
    example: 'Piutang Karyawan',
  })
  coaName: string;

  @ApiProperty({
    description: 'Debit',
    example: 900000,
  })
  debit: number;

  @ApiProperty({
    description: 'Credit',
    example: 900000,
  })
  credit: number;

  @ApiProperty({
    description: 'Is this item Ledger?',
    example: true,
  })
  isLedger: boolean;

  @ApiProperty({
    description: 'Journal State',
    example: JournalState.DRAFT,
    enum: JournalState,
  })
  state: JournalState;
}
