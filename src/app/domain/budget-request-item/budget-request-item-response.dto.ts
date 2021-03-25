import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BudgetRequestItemResponseMapper } from './budget-request-item-response.mapper.dto';
import { BudgetRequestItemDTO } from './budget-request-item.dto';

export class BudgetRequestItemResponse extends BaseResponse {
  constructor(data?: Partial<BudgetRequestItemDTO | BudgetRequestItemDTO[]>) {
    super();
    if (data) {
      this.data = BudgetRequestItemResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [BudgetRequestItemDTO] })
  data?: BudgetRequestItemDTO | BudgetRequestItemDTO[] = null;
}

export class BudgetRequestItemWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<BudgetRequestItemDTO | BudgetRequestItemDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = BudgetRequestItemResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [BudgetRequestItemDTO] })
  data?: BudgetRequestItemDTO | BudgetRequestItemDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
