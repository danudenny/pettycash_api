import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';
import { AccountStatementType } from '../../../model/utils/enum';

export class CreateAccountStatementDTO {
  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-03-15',
  })
  @IsISO8601({ strict: false })
  transactionDate?: Date;

  @ApiProperty({
    description: 'Transaction Type',
    example: AccountStatementType.BANK,
    enum: AccountStatementType,
  })
  type: AccountStatementType;

  @ApiProperty({
    description: 'Amount',
    example: 25000,
  })
  amount: number;
}
