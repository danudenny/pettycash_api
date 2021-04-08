import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { BalanceSummaryDTO } from './summary-balance.dto';
import { BalanceSummaryResponseMapper } from './summary-response.mapper';

export class BalanceSummaryResponse extends BaseResponse {
  constructor(data?: BalanceSummaryDTO[]) {
    super();
    if (data) {
      this.data = BalanceSummaryResponseMapper.fromQueryBuilder(data);
    }
  }

  @ApiPropertyOptional({ type: () => BalanceSummaryDTO })
  data?: BalanceSummaryDTO = null;
}
