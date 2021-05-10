import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class JournalItemDTO {
  @ApiProperty({
    description: 'JournalItem ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

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
    description: 'Description',
    example: '[PPH 23 Gross UP] Description Item',
  })
  description: string;

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
}
