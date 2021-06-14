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
  @IsOptional()
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
    description: 'Employee ID',
    example: '4719ee67-6197-4771-8feb-f3db2cdc9d2f',
  })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Down Payment ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  @IsOptional()
  downPaymentId?: string;

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
