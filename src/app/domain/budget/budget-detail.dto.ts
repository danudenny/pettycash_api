import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { BudgetState } from '../../../model/utils/enum';
import { BudgetHistoryDTO } from './budget-history.dto';
import { BudgetItemDTO } from '../budget-item/budget-item.dto';

export class BudgetDetailDTO {
  @ApiProperty({
    description: 'Budget ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Budget Branch Id',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  branchId: string;

  @ApiProperty({
    description: 'Budget Branch Name',
    example: 'Bandung',
  })
  branchName: String;

  @ApiProperty({
    description: 'Budget Number',
    example: 'REL-2020/01/AAB112',
  })
  number: string;

  @ApiProperty({
    description: 'Responsible User Id',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  responsibleUserId: string;

  @ApiProperty({
    description: 'Responsible User First Name',
    example: 'Michael',
  })
  responsibleUserFirstName: string;

  @ApiProperty({
    description: 'Responsible User Last Name',
    example: 'Jordan',
  })
  responsibleUserLastName: string;

  @ApiProperty({
    description: 'Responsible Username',
    example: 'mjordan',
  })
  responsibleUserUsername: string;

  @ApiProperty({
    description: 'Budget Start Date',
    example: '2021-01-27',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Budget End Date',
    example: '2021-01-27',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Total Amount',
    example: 900000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Minimum Amount',
    example: 0,
  })
  minimumAmount: number;

  @ApiProperty({
    description: 'Budget State',
    example: BudgetState.DRAFT,
    enum: BudgetState,
  })
  state: BudgetState;

  @ApiProperty({
    description: 'Budget Rejected Note',
    example: 'ditolak',
  })
  rejectedNote: string;

  @ApiProperty({
    description: 'Budget Items',
    type: [BudgetItemDTO],
  })
  @IsArray()
  items: BudgetItemDTO[];

  @ApiProperty({
    description: 'Budget Histories',
    type: [BudgetHistoryDTO],
  })
  @IsArray()
  histories: BudgetHistoryDTO[];
}
