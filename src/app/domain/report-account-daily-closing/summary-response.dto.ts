import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { ReportAccountDailyClosingSummaryResponseMapper } from './summary-response.mapper';
import { ReportAccountDailyClosingSummaryDTO } from './summary.dto';

export class ReportAccountDailyClosingSummaryResponse extends BaseResponse {
  constructor(data?: ReportAccountDailyClosingSummaryDTO[]) {
    super();
    if (data) {
      this.data = ReportAccountDailyClosingSummaryResponseMapper.fromQueryBuilder(
        data,
      );
    }
  }

  @ApiPropertyOptional({ type: () => ReportAccountDailyClosingSummaryDTO })
  data?: ReportAccountDailyClosingSummaryDTO = null;
}
