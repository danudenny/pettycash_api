import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BudgetDTO } from './budget.dto';
import { BudgetResponseMapper } from './budget-response.mapper.dto';

export class BudgetResponse extends BaseResponse {
  constructor(data?: Partial<BudgetDTO | BudgetDTO[]>) {
    super();
    if (data) {
      this.data = BudgetResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [BudgetDTO] })
  data?: BudgetDTO | BudgetDTO[] = null;
}

export class BudgetWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<BudgetDTO | BudgetDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = BudgetResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [BudgetDTO] })
  data?: BudgetDTO | BudgetDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
