import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';
import { AccountStatementMutationType } from '../../../model/utils/enum';

export class CreateAccountStatementDTO {
  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-03-15',
  })
  @IsISO8601({ strict: false })
  transactionDate?: Date;

  @ApiProperty({
    description: 'Transaction Type',
    example: AccountStatementMutationType.BANK_TO_CASH,
    enum: AccountStatementMutationType,
  })
  type: AccountStatementMutationType;

  @ApiProperty({
    description: 'Amount',
    example: 25000,
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Tarik Tunai',
  })
  description?: string;
}
