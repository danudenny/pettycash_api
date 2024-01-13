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
    description: 'Employee NIK',
    example: '202011844',
  })
  employeeNik: string;

  @ApiProperty({
    description: 'Employee Name',
    example: 'Silvia Agustin',
  })
  employeeName: string;

  @ApiProperty({
    description: 'Employee Position Name (Jabatan)',
    example: 'Admin Finance',
  })
  employeePositionName: string;

  @ApiProperty({
    description: 'Origin',
    example: 'expense',
  })
  origin: string;

  @ApiProperty({
    description: 'Destination',
  })
  destination: string;

  @ApiProperty({
    description: 'Partner Name',
    example: 'CV. Elaraya Abadi',
  })
  partnerName: string;

  @ApiProperty({
    description: 'Create User Full Name',
    example: 'Evalia Damayanti',
  })
  createUserFullName: string;

  @ApiProperty({
    description: 'NOTA/NO.INVOICE',
    example: 'Parkir Admin',
  })
  nota: string;

  @ApiProperty({
    description: 'Description',
    example: 'penarikan uang harian',
  })
  description: string;
}
