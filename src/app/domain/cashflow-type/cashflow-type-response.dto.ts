import { BaseResponse } from '../common/base-response.dto';
import { CashflowTypeDto } from './cashflow-type.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { CashFlowResponseMapper } from './cashflow-type-response.mapper.dto';

export class CashflowTypeWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<CashflowTypeDto | CashflowTypeDto[]>, params?: any) {
    super();
    if (data) {
      this.data = CashFlowResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [CashflowTypeDto] })
  data?: CashflowTypeDto | CashflowTypeDto[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}