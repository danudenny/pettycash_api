import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateBudgetRequestItemDTO, UpdateBudgetRequestItemDTO } from '../budget-request-item/budget-request-item-create.dto';

export class CreateBudgetRequestDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Budget ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  budgetId: string;

  @ApiProperty({
    description: 'Budget Request Number',
    example: 'BG001',
  })
  number: string;

  @ApiProperty({
    description: 'Responsible User ID',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  responsibleUserId: string;

  @ApiProperty({
    description: 'Budget Request Need Date',
    example: '2021-01-10',
  })
  needDate: Date;

  @ApiProperty({
    description: 'Budget Request Total Amount',
    example: 5000000.0,
  })
  @IsOptional()
  totalAmount: number;

  @ApiProperty({
    description: 'Budget Items',
    type: [CreateBudgetRequestItemDTO],
  })
  @IsArray()
  items: CreateBudgetRequestItemDTO[];
}

export class UpdateBudgetRequestDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Budget ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  budgetId: string;

  @ApiProperty({
    description: 'Budget Request Number',
    example: 'BG001',
  })
  number: string;

  @ApiProperty({
    description: 'Responsible User ID',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  responsibleUserId: string;

  @ApiProperty({
    description: 'Budget Request Need Date',
    example: '2021-01-10',
  })
  needDate: Date;

  @ApiProperty({
    description: 'Budget Request Total Amount',
    example: 5000000.0,
  })
  @IsOptional()
  totalAmount: number;

  @ApiProperty({
    description: 'Budget Items',
    type: [UpdateBudgetRequestItemDTO],
  })
  @IsArray()
  items: UpdateBudgetRequestItemDTO[];
}

export class RejectBudgetRequestDTO {
  @ApiProperty({
    description: 'Budget Rejection Note',
    example: 'Budget melebihi batas minimum'
  })
  @IsOptional()
  rejectedNote: string
}
