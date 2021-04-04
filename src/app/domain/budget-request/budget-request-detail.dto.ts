import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { BudgetRequestState } from '../../../model/utils/enum';
import { BudgetRequestItemDTO } from '../budget-request-item/budget-request-item.dto';
import { BudgetRequestHistoryDTO } from './budget-request-history.dto';

export class BudgetRequestDetailDTO {
  @ApiProperty({
    description: 'Budget Request ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Budget Request Branch Id',
    example: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
  })
  branchId: string;

  @ApiProperty({
    description: 'Budget Request Branch Name',
    example: 'Bandung',
  })
  branchName: String;

  @ApiProperty({
    description: 'Budget Request Number',
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
    description: 'Budget Request Need Date',
    example: '2021-01-27',
  })
  needDate: Date;

  @ApiProperty({
    description: 'Total Amount',
    example: 900000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Budget State',
    example: BudgetRequestState.DRAFT,
    enum: BudgetRequestState,
  })
  state: BudgetRequestState;

  @ApiProperty({
    description: 'Budget Request Rejected Note',
    example: 'ditolak',
  })
  rejectedNote: string;

  @ApiProperty({
    description: 'Budget Request Items',
    type: [BudgetRequestItemDTO],
  })
  @IsArray()
  items: BudgetRequestItemDTO[];

  @ApiProperty({
    description: 'Budget Histories',
    type: [BudgetRequestHistoryDTO],
  })
  @IsArray()
  histories: BudgetRequestHistoryDTO[];
}
