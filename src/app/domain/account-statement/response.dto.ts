import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { AccountStatementDTO } from './account-statement.dto';
import { AccountStatementResponseMapper } from './response.mapper';

export class AccountStatementWithPaginationResponse extends BaseResponse {
  constructor(data?: any[], params?: any) {
    super();
    if (data) {
      this.data = AccountStatementResponseMapper.fromQueryBuilder(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [AccountStatementDTO] })
  data?: AccountStatementDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
