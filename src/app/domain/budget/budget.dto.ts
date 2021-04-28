import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { BudgetState } from '../../../model/utils/enum';
import { Type } from 'class-transformer';
import { CreateBudgetItemDTO } from '../budget-item/budget-item-create.dto';

export class BudgetDTO {
  @ApiProperty({
    description: 'Budget ID',
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
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  @IsString()
  branchName: string;

  @ApiProperty({
    description: 'Branch Code',
    example: '3601001',
  })
  @IsOptional()
  @IsString()
  branchCode: string;

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
    description: 'Budget Start Date',
    example: '2021-01-29',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Budget End Date',
    example: '2021-01-29',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
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

export class FindBudgetIdParams {
  @IsUUID()
  branchId: string;
}
