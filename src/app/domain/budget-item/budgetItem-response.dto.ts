import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BudgetItemResponseMapper } from './budgetItem-response.mapper.dto';
import { BudgetItemDTO } from './budget-item.dto';

export class BudgetItemResponse extends BaseResponse {
  constructor(data?: Partial<BudgetItemDTO | BudgetItemDTO[]>) {
    super();
    if (data) {
      this.data = BudgetItemResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [BudgetItemDTO] })
  data?: BudgetItemDTO | BudgetItemDTO[] = null;
}

export class BudgetItemWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<BudgetItemDTO | BudgetItemDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = BudgetItemResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [BudgetItemDTO] })
  data?: BudgetItemDTO | BudgetItemDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
