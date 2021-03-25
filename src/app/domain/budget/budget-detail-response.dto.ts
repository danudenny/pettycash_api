import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { BudgetDetailResponseMapper } from './budget-detail-response.mapper';
import { BudgetDetailDTO } from './budget-detail.dto';
import { Budget } from '../../../model/budget.entity';

export class BudgetDetailResponse extends BaseResponse {
  constructor(data?: Partial<Budget>) {
    super();
    if (data) {
      this.data = BudgetDetailResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => BudgetDetailDTO })
  data?: BudgetDetailDTO = null;
}
