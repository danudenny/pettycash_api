import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BalanceDTO } from './balance.dto';
import { BalanceResponseMapper } from './response.mapper';

export class BalanceWithPaginationResponse extends BaseResponse {
  constructor(data?: any[], params?: any) {
    super();
    if (data) {
      this.data = BalanceResponseMapper.fromQueryBuilder(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [BalanceDTO] })
  data?: BalanceDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
