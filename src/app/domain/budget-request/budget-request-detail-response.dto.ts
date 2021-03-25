import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { BudgetRequestDetailResponseMapper } from './budget-request-detail-response.mapper';
import { BudgetRequestDetailDTO } from './budget-request-detail.dto';
import { BudgetRequest } from '../../../model/budget.request.entity';

export class BudgetRequestDetailResponse extends BaseResponse {
  constructor(data?: Partial<BudgetRequest>) {
    super();
    if (data) {
      this.data = BudgetRequestDetailResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => BudgetRequestDetailDTO })
  data?: BudgetRequestDetailDTO = null;
}
