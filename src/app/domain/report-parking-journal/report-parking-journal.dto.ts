import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReportParkingJournalDTO {
  @ApiProperty({
    description: 'Journal Item ID',
    example: '615aa3c1-36b1-419e-a3fc-45fe1a8b3e70',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-01-27',
  })
  transactionDate: Date;

  @ApiProperty({
    description: 'Create Date (Tanggal Pencatatan)',
    example: '2021-05-23T12:02:18.227Z',
  })
  createdAt: Date;

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
    description: 'CoA Code',
    example: '500.100.11',
  })
  coaCode: string;

  @ApiProperty({
    description: 'Product Name (Jenis Biaya)',
    example: 'Uang Makan',
  })
  productName: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Medan',
  })
  branchName: string;

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
    description: 'Partner Name',
    example: 'Rivan Amzar Maunia',
  })
  partnerName: string;
}
