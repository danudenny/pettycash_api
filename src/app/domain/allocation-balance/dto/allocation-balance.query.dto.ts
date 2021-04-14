import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CashBalanceAllocationState } from '../../../../model/utils/enum';
import { Transform } from 'class-transformer';

export class AllocationBalanceQueryDTO {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page Number',
  })
  @Transform((value) => value || 1)
  @IsOptional()
  page: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'The maximum number of results data to return.',
  })
  @Transform((value) => value || 10)
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Allocation Balance Date to filter',
    example: '2020-03-15',
  })
  createdDate: Date;

  @ApiPropertyOptional({
    description: 'Branch ID to filter',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsOptional()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({
    description: 'Number to filter',
    example: 'ASK/2021/03/21/QWER123',
  })
  @IsOptional()
  @IsUUID()
  number__contains: string;

  @ApiPropertyOptional({
    description: 'Allocation Balance State for filter to `status`',
    example: CashBalanceAllocationState.DRAFT,
    enum: CashBalanceAllocationState,
  })
  state: CashBalanceAllocationState;
}
