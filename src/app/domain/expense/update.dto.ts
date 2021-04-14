import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { ExpensePaymentType } from '../../../model/utils/enum';
import { UpdateExpenseItemDTO } from './update-item.dto';

export class UpdateExpenseDTO {
  @ApiPropertyOptional({
    description: 'Transaction Date',
    example: '2021-03-15',
  })
  @IsISO8601({ strict: false })
  transactionDate?: Date;

  @ApiPropertyOptional({
    description: 'Period ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  @IsOptional()
  periodId?: string;

  @ApiPropertyOptional({
    description: 'Partner ID',
    example: '84ada2dd-5750-479b-ae54-7edd81dfe35c',
  })
  @IsUUID()
  @IsOptional()
  partnerId?: string;

  @ApiPropertyOptional({
    description: 'Source Document',
    example: 'PARKIR-001',
  })
  @IsOptional()
  sourceDocument?: string;

  @ApiPropertyOptional({
    description: 'Expense Payment Type',
    example: ExpensePaymentType.BANK,
    enum: ExpensePaymentType,
  })
  @IsOptional()
  paymentType?: ExpensePaymentType;

  @ApiPropertyOptional({
    description: 'Expense Items',
    type: [UpdateExpenseItemDTO],
  })
  @IsOptional()
  @IsArray()
  items?: UpdateExpenseItemDTO[];
}
