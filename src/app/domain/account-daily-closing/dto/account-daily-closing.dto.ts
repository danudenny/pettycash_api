import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AccountDailyClosingDTO {
  @ApiProperty({
    description: 'Account Daily Closing ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Closing Date',
    example: '2021-04-05',
  })
  closingDate: Date;

  @ApiProperty({
    description: 'Responsible User ID',
    example: '8fed518e-aff2-4ef9-9d6e-562bdc2d8bdd',
  })
  responsibleUserId: string;

  @ApiProperty({
    description: 'Responsible User NIK',
    example: 'general',
  })
  responsibleUserNik: string;

  @ApiProperty({
    description: 'Responsible User First Name',
    example: 'James',
  })
  responsibleUserFirstName: string;

  @ApiProperty({
    description: 'Responsible User Last Name',
    example: 'Bond',
  })
  responsibleUserLastName: string;

  @ApiProperty({
    description: 'Opening Bank Amount (Saldo Sistem)',
    example: 2000000,
  })
  openingBankAmount: number;

  @ApiProperty({
    description: 'Closing Bank Amount (Saldo Bank)',
    example: 2000000,
  })
  closingBankAmount: number;

  @ApiProperty({
    description: 'Opening Cash Amount (Uang Fisik)',
    example: 2000000,
  })
  openingCashAmount: number;

  @ApiProperty({
    description: 'Closing Cash Amount (Saldo Uang Fisik)',
    example: 500000,
  })
  closingCashAmount: number;

  @ApiProperty({
    description: 'Opening Bon Amount (Bon Fisik)',
    example: 2000000,
  })
  openingBonAmount: number;

  @ApiProperty({
    description: 'Closing Bon Amount (Saldo Bon Fisik)',
    example: 500000,
  })
  closingBonAmount: number;

  @ApiProperty({
    description: 'Total Opening Amount (Total Saldo Fisik)',
    example: 2000000,
  })
  totalOpeningAmount: number;

  @ApiProperty({
    description: 'Total Closing Amount (Total Saldo Aktual)',
    example: 2000000,
  })
  totalClosingAmount: number;

  @ApiProperty({
    description: 'Closing Cash Amount Diff',
    example: 500000,
  })
  cashDifference: number;

  @ApiProperty({
    description: 'Closing Bank Amount Diff',
    example: 500000,
  })
  bankDifference: number;

  @ApiProperty({
    description: 'Closing Bon Amount Diff',
    example: 500000,
  })
  bonDifference: number;

  @ApiProperty({
    description: 'Total Closing Amount Diff',
    example: 500000,
  })
  totalDifference: number;

  @ApiProperty({
    description:
      'Reason for execute daily closing when deviation does not meets',
    example: 'Pending',
  })
  reasonBank: string;

  @ApiProperty({
    description:
      'Reason for execute daily closing when deviation does not meets',
    example: 'Pending',
  })
  reasonCash: string;

  @ApiProperty({
    description:
      'Reason for execute daily closing when deviation does not meets',
    example: 'Pending',
  })
  reasonBon: string;
}
