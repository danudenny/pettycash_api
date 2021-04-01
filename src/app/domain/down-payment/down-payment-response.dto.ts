import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationBuilder } from '../common/pagination-builder';
/** Entity */
import { DownPayment } from '../../../model/down-payment.entity';
/** Interfaces */
import { BaseResponse } from '../common/base-response.dto';
import { DownPaymentDTO, ShowDownPaymentDTO } from './down-payment.dto';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { DownPaymentResponseMapper } from './down-payment-response.mapper.dto';
import { ShowDownPaymentResponseMapper } from './down-payment-detail-response.mapper.dto';

export class DownPaymentResponse extends BaseResponse {
  constructor(data?: Partial<DownPaymentDTO | DownPaymentDTO[]>) {
    super();
    if (data) {
      this.data = DownPaymentResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => DownPaymentDTO })
  data?: DownPaymentDTO | DownPaymentDTO[] = null;
}

export class DownPaymentsWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<DownPaymentDTO | DownPaymentDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = DownPaymentResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [DownPaymentDTO] })
  data?: DownPaymentDTO | DownPaymentDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}

export class ShowDownPaymentResponse extends BaseResponse {
  constructor(data?: Partial<DownPayment>) {
    super();
    if (data) {
      this.data = ShowDownPaymentResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => ShowDownPaymentDTO })
  data?: ShowDownPaymentDTO = null;
}
