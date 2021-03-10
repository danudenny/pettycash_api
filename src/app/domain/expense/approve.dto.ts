import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class ApproveExpenseItemDTO {
  @ApiProperty({
    description: 'Item ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiPropertyOptional({
    description: 'Item PIC HO Amount',
    example: 25000,
  })
  @IsOptional()
  picHoAmount?: number;

  @ApiPropertyOptional({
    description: 'Item SS HO Amount',
    example: 35000,
  })
  @IsOptional()
  ssHoAmount?: number;

  @ApiProperty({
    description: 'Checked Note',
    example: 'OK',
  })
  @IsOptional()
  checkedNote?: string;
}

export class ApproveExpenseDTO {
  @ApiPropertyOptional({
    description: 'Expense Items',
    type: [ApproveExpenseItemDTO],
  })
  @IsOptional()
  @IsArray()
  items?: ApproveExpenseItemDTO[];
}
