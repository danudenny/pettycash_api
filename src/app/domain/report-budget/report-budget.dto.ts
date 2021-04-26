import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportBudgetDTO {
  @ApiProperty({
    description: 'Budget ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Budget Number', example: 'BG001' })
  number: string;

  @ApiProperty({ description: 'Branch Name', example: 'Kebun Jeruk' })
  branchName: string;

  @ApiProperty({ description: 'Request User', example: '734736-Rian-PIC HO' })
  responsibleUser: string;

  @ApiProperty({ description: 'Start Date', example: '2021-01-01' })
  startDate: Date;

  @ApiProperty({ description: 'End Date', example: '2021-01-10' })
  endDate: Date; 

  @ApiProperty({ description: 'Product Name', example: 'Listrik' })
  productName: string;

  @ApiProperty({ description: 'Total Amount', example: 200000 })
  totalAmount: number;

  @ApiProperty({ description: 'Expense Amount', example: 100000 })
  expenseAmount: number;
}
