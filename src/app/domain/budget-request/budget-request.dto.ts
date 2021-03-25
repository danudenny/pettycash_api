import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { BudgetRequestState } from '../../../model/utils/enum';
import { Type } from 'class-transformer';

export class BudgetRequestDTO {
  @ApiProperty({
    description: 'Budget Request ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

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
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  @IsString()
  branchName: string;

  @ApiProperty({
    description: 'Budget Request Number',
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
    description: 'Responsible User First Name',
    example: 'Budi',
  })
  responsibleUserFirstName: string;

  @ApiProperty({
    description: 'Responsible User Last Name',
    example: 'Handoko',
  })
  responsibleUserLastName: string;

  @ApiProperty({
    description: 'Responsible User Username',
    example: '18122009',
  })
  responsibleUserUsername: string;

  @ApiProperty({
    description: 'Budget Request Start Date',
    example: '2021-01-29',
  })
  @IsDate()
  @Type(() => Date)
  needDate: Date;

  @ApiProperty({
    description: 'Budget Request Total Amount',
    example: 5000000.0,
  })
  @IsOptional()
  totalAmount: number;

  @ApiProperty({
    description: 'Budget Request State',
    example: BudgetRequestState.DRAFT,
    enum: BudgetRequestState,
  })
  state: BudgetRequestState;

  @ApiProperty({
    description: 'Budget Request Rejection Note',
    example: 'Budget melebihi batas minimum'
  })
  @IsOptional()
  rejectedNote: string
}

export class FindBudgetRequestIdParams {
  @IsUUID()
  branchId: string;
}
