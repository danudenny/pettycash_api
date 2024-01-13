import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { ReportParkingJournalDTO } from './report-parking-journal.dto';
import { ReportParkingJournalResponseMapper } from './response.mapper';

export class ReportParkingJournalWithPaginationResponse extends BaseResponse {
  constructor(
    data?: ReportParkingJournalDTO | ReportParkingJournalDTO[],
    params?: any,
  ) {
    super();
    if (data) {
      this.data = ReportParkingJournalResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [ReportParkingJournalDTO] })
  data?: ReportParkingJournalDTO | ReportParkingJournalDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
