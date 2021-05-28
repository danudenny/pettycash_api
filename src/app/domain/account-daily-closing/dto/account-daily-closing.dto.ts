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
    description: 'Reason for execute daily closing when deviation does not meets',
    example: 'Pending',
  })
  reason: string;
}
