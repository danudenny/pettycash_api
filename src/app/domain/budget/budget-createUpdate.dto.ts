import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { BudgetState } from '../../../model/utils/enum';

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
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
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

  @ApiProperty({
    description: 'Budget State',
    example: BudgetState.DRAFT,
    enum: BudgetState,
  })
  state: BudgetState;

}

export class UpdateBudgetDTO {
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
  @IsString()
  number: string;

  @ApiProperty({
    description: 'Responsible User ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  responsibleUserId: string;

  @ApiProperty({
    description: 'Budget Start Date',
    example: '2021-01-10',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Budget End Date',
    example: '2021-01-16',
  })
  @IsDate()
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
}

export class RejectBudgetDTO {
  @ApiProperty({
    description: 'Budget Rejection Note',
    example: 'Budget melebihi batas minimum'
  })
  @IsOptional()
  rejectedNote: string
}
