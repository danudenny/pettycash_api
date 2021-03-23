import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { DownPaymentState, MASTER_ROLES } from "../../../model/utils/enum";

export class DownPaymentHistoryDTO {
  @ApiProperty({description: 'History ID',example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',})
  @IsUUID()
  id: string;
  
  @ApiProperty({description: 'User ID',example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',})
  @IsUUID()
  userId: string;

  @ApiProperty({description: 'Down Payment ID',example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',})
  @IsUUID()
  downPaymentId: string;

  @ApiProperty({ description: 'User Full Name', example: 'Jenny Safitri',})
  userFullName: string;

  @ApiProperty({ description: 'User Role', example: MASTER_ROLES.PIC_HO,})
  userRole: MASTER_ROLES;

  @ApiProperty({ description: 'Branch Name', example: 'Kebon Jeruk',})
  branchName: string;
  
  @ApiProperty({description: 'Down Payment State',example: DownPaymentState.DRAFT,})
  state: DownPaymentState;

  @ApiProperty({description: 'Rejected Note',example: 'Not OK',})
  rejectedNote: string;

  @ApiProperty({description: 'CreatedAt',})
  createdAt: Date;
}

