import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../common/base-response.dto';
import { CashBalanceAllocation } from '../../../../model/cash.balance.allocation.entity';
import { AllocationBalanceDetailDTO } from './allocation-balance.dto';
import { AllocationDetailResponseMapper } from '../response-mapper/allocation-balance-detail.mapper.dto';

export class AllocationBalanceDetailResponse extends BaseResponse {
  constructor(data?: Partial<CashBalanceAllocation>) {
    super();
    if (data) {
      this.data = AllocationDetailResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => AllocationBalanceDetailDTO })
  data?: AllocationBalanceDetailDTO = null;
}
