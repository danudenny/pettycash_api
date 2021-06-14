import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CashBalanceAllocationState } from '../../../../model/utils/enum';
import { Transform } from 'class-transformer';
import { BasePayload } from '../../common/base-payload.dto';

export class AllocationBalanceQueryDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Allocation Balance Date to filter',
    example: '2020-03-15',
  })
  receivedDate: Date;

  @ApiPropertyOptional({
    description: 'Branch ID to filter',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsOptional()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({
    description: 'Number to filter',
    example: 'ASK202103QWER123',
  })
  @IsOptional()
  number__contains: string;

  @ApiPropertyOptional({
    description: 'Allocation Balance State for filter to `status`',
    example: CashBalanceAllocationState.DRAFT,
    enum: CashBalanceAllocationState,
  })
  state: CashBalanceAllocationState;
}
