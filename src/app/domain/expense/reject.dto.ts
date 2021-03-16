import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RejectExpenseDTO {
  @ApiPropertyOptional({
    description: 'Rejection Note',
    example: 'Pengeluaran terlalu besar',
  })
  @IsOptional()
  rejectedNote?: string;
}
