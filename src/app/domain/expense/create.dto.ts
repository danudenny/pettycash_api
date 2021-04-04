import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { ExpensePaymentType } from '../../../model/utils/enum';
import { CreateExpenseItemDTO } from './create-item.dto';

export class CreateExpenseDTO {
  @ApiPropertyOptional({
    description: 'Expense Number',
    example: 'REL202002AAB112',
  })
  @IsOptional()
  number: string;

  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-03-15',
  })
  @IsISO8601({ strict: false })
  transactionDate?: Date;

  @ApiProperty({
    description: 'Period ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  periodId: string;

  @ApiProperty({
    description: 'Partner ID',
    example: '84ada2dd-5750-479b-ae54-7edd81dfe35c',
  })
  @IsUUID()
  partnerId: string;

  @ApiPropertyOptional({
    description: 'Down Payment ID',
    example: 'b60b522a-d2d9-429c-83da-6f9c0f32bbf9',
  })
  @IsUUID()
  @IsOptional()
  downPaymentId: string;

  @ApiPropertyOptional({
    description: 'Source Document',
    example: 'PARKIR-001',
  })
  @IsOptional()
  sourceDocument: string;

  @ApiPropertyOptional({
    description: 'Expense Payment Type',
    example: ExpensePaymentType.BANK,
    enum: ExpensePaymentType,
  })
  paymentType: ExpensePaymentType;

  @ApiProperty({
    description: 'Expense Items',
    type: [CreateExpenseItemDTO],
  })
  @IsArray()
  items: CreateExpenseItemDTO[];
}
