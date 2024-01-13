import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationBuilder } from '../common/pagination-builder';
/** Interfaces */
import { BaseResponse } from '../common/base-response.dto';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { ReportDownPaymentDTO } from './report-down-payment.dto';
import { ReportDownPaymentResponseMapper } from './report-down-payment-response.mapper.dto';

export class ReportDownPaymentsWithPaginationResponse extends BaseResponse {
  constructor(
    data?: Partial<ReportDownPaymentDTO | ReportDownPaymentDTO[]>,
    params?: any,
  ) {
    super();
    if (data) {
      this.data = ReportDownPaymentResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [ReportDownPaymentDTO] })
  data?: ReportDownPaymentDTO | ReportDownPaymentDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
