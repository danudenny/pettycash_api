import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsISO8601 } from 'class-validator';
import { CreateAccountCashboxItemsDTO } from './create-account-cashbox-items.dto';

export class CreateAccountDailyClosingDTO {
  @ApiProperty({
    description: 'Closing Date',
    example: '2021-01-27',
  })
  @IsISO8601({ strict: false })
  closingDate: Date;

  @ApiProperty({
    description: 'Opening Bank Amount (Saldo Sistem)',
    example: 2000000,
  })
  openingBankAmount: number;

  @ApiProperty({
    description: 'Closing Bank Amount (Saldo Bank)',
    example: 2000500,
  })
  closingBankAmount: number;

  @ApiProperty({
    description: 'Opening Cash Amount (Uang Fisik)',
    example: 2000000,
  })
  openingCashAmount: number;

  @ApiProperty({
    description: 'Closing Cash Amount (Saldo Uang Fisik)',
    example: 2000000,
  })
  closingCashAmount: number;

  @ApiProperty({
    description: 'Account Cashbox Items',
    type: [CreateAccountCashboxItemsDTO],
  })
  @IsArray()
  accountCashboxItems: CreateAccountCashboxItemsDTO[];
}
