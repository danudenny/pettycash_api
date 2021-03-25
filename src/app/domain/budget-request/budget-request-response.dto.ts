import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BudgetRequestDTO } from './budget-request.dto';
import { BudgetRequestResponseMapper } from './budget-request-response.mapper.dto';

export class BudgetRequestResponse extends BaseResponse {
  constructor(data?: Partial<BudgetRequestDTO | BudgetRequestDTO[]>) {
    super();
    if (data) {
      this.data = BudgetRequestResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => BudgetRequestDTO })
  data?: BudgetRequestDTO | BudgetRequestDTO[] = null;
}

export class BudgetRequestWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<BudgetRequestDTO | BudgetRequestDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = BudgetRequestResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [BudgetRequestDTO] })
  data?: BudgetRequestDTO | BudgetRequestDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
