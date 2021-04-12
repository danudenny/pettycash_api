import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportDownPaymentDTO {
  @ApiProperty({
    description: 'Down Payment ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Down Payment Number', example: 'UM001' })
  numberDownPayment: string;

  @ApiProperty({ description: 'Branch Name', example: 'Kebun Jeruk' })
  branchName: string;

  @ApiProperty({ description: ' Down Payment Amount', example: 20000 })
  amountDownPayment: number;

  @ApiProperty({
    description: 'Expense amount (Nilai Realisasi)',
    example: 18000,
  })
  amountRealized: number;

  @ApiProperty({ description: 'Loan amount (Pelunasan)', example: 2000 })
  amountRepayment: number;
}
