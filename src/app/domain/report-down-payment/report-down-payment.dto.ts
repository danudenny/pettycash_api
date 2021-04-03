import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportDownPaymentDTO {
  @ApiProperty({ description: 'Down Payment ID', example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',})
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Number Down Payment', example: 'UM001' })
  number: string;

  @ApiProperty({ description: 'Amount Down Payment', example: 20000 })
  amount: number;
  
  @ApiProperty({ description: 'total Realize', example: 20000 })
  totalRealized: number;

  @ApiProperty({ description: 'Branch ID', example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',})
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'Branch Name', example: 'Kebun Jeruk' })
  branchName: string;
 
  @ApiProperty({ description: 'Expense ID', example: 'd2613fdc-8b7c-486e-90e6-aba5d4a819cb',})
  @IsUUID()
  expenseId: string;

  @ApiProperty({ description: 'Realized', example: false })
  isRealized?: boolean;

  @ApiProperty({ description: 'Date', example: '2021-01-29T09:00:29.803Z' })
  transactionDate: Date;
}

