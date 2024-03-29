import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { BudgetHistory } from '../../../model/budget-history.entity';
import { BudgetState } from '../../../model/utils/enum';
import { CreateBudgetItemDTO, UpdateBudgetItemDTO } from '../budget-item/budget-item-create.dto';
import { BudgetHistoryDTO } from './budget-history.dto';

export class CreateBudgetDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Budget Number',
    example: 'BG001',
  })
  number: string;

  @ApiProperty({
    description: 'Responsible User ID',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  responsibleUserId: string;

  @ApiProperty({
    description: 'Budget Start Date',
    example: '2021-01-10',
  })
  @IsOptional()
  startDate: Date;

  @ApiProperty({
    description: 'Budget End Date',
    example: '2021-01-16',
  })
  @IsOptional()
  endDate: Date;

  @ApiProperty({
    description: 'Budget Minimum Amount',
    example: 2000000.0,
  })
  @IsOptional()
  minimumAmount: number;

  @ApiProperty({
    description: 'Budget Total Amount',
    example: 5000000.0,
  })
  @IsOptional()
  totalAmount: number;

  // @ApiProperty({
  //   description: 'Budget State',
  //   example: BudgetState.DRAFT,
  //   enum: BudgetState,
  // })
  // state: BudgetState;

  @ApiProperty({
    description: 'Budget Items',
    type: [CreateBudgetItemDTO],
  })
  @IsArray()
  items: CreateBudgetItemDTO[];
}

export class UpdateBudgetDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Responsible User ID',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  @IsUUID()
  responsibleUserId: string;

  @ApiProperty({
    description: 'Budget Start Date',
    example: '2021-01-10',
  })
  @IsOptional()
  startDate: Date;

  @ApiProperty({
    description: 'Budget End Date',
    example: '2021-01-16',
  })
  @IsOptional()
  endDate: Date;

  @ApiProperty({
    description: 'Budget Minimum Amount',
    example: 2000000.0,
  })
  @IsOptional()
  minimumAmount: number;

  @ApiProperty({
    description: 'Budget Total Amount',
    example: 5000000.0,
  })
  @IsOptional()
  totalAmount: number;

  @ApiProperty({
    description: 'Budget State',
    example: BudgetState.DRAFT,
    enum: BudgetState,
  })
  state: BudgetState;

  @ApiProperty({
    description: 'Budget Rejection Note',
    example: 'Budget melebihi batas minimum'
  })
  @IsOptional()
  rejectedNote: string

  @ApiProperty({
    description: 'Budget Items',
    type: [UpdateBudgetItemDTO],
  })
  @IsArray()
  items: UpdateBudgetItemDTO[];

  // @ApiProperty({
  //   description: 'Histories Budget',
  //   type: [BudgetHistoryDTO],
  // })
  // @IsArray()
  // histories: BudgetHistoryDTO[];
}

export class RejectBudgetDTO {
  @ApiProperty({
    description: 'Budget Rejection Note',
    example: 'Budget melebihi batas minimum'
  })
  @IsOptional()
  rejectedNote: string
}
