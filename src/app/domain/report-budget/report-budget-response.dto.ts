import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationBuilder } from '../common/pagination-builder';
/** Interfaces */
import { BaseResponse } from '../common/base-response.dto';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { ReportBudgetDTO } from './report-budget.dto';
import { ReportBudgetResponseMapper } from './report-budget-response.mapper.dto';

export class ReportBudgetsWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<ReportBudgetDTO | ReportBudgetDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = ReportBudgetResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [ReportBudgetDTO] })
  data?: ReportBudgetDTO | ReportBudgetDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}

