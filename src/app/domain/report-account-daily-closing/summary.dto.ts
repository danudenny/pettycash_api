import { ApiProperty } from '@nestjs/swagger';

export class ReportAccountDailyClosingSummaryDTO {
  @ApiProperty({
    description: 'Opening Bank Amount',
    example: 2000000,
  })
  openingBankAmount: number;

  @ApiProperty({
    description: 'Closing Bank Amount',
    example: 2000000,
  })
  closingBankAmount: number;

  @ApiProperty({
    description: 'Opening Cash Amount',
    example: 3000000,
  })
  openingCashAmount: number;

  @ApiProperty({
    description: 'Closing Cash Amount',
    example: 3000000,
  })
  closingCashAmount: number;

  @ApiProperty({
    description: 'Opening Bon Amount',
    example: 1000000,
  })
  openingBonAmount: number;

  @ApiProperty({
    description: 'Closing Bon Amount',
    example: 1000000,
  })
  closingBonAmount: number;
}
