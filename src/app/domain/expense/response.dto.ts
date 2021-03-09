import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { ExpenseDTO, ExpenseRelationDTO } from './expense.dto';
import { ExpenseResponseMapper } from './response.mapper';
import { ExpenseRelationalResponseMapper } from './response-expenseItem.dto';

export class ExpenseResponse extends BaseResponse {
  constructor(data?: Partial<ExpenseDTO | ExpenseDTO[]>) {
    super();
    if (data) {
      this.data = ExpenseResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => ExpenseDTO })
  data?: ExpenseDTO | ExpenseDTO[] = null;
}

export class ExpenseRelationResponse extends BaseResponse {
  constructor(data?: Partial<ExpenseRelationDTO | ExpenseRelationDTO[]>) {
    super();
    if (data) {
      this.data = ExpenseRelationalResponseMapper.fromRelationalDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [ExpenseRelationDTO] })
  data?: ExpenseRelationDTO | ExpenseRelationDTO[] = null;
}

export class ExpenseWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<ExpenseDTO | ExpenseDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = ExpenseResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [ExpenseDTO] })
  data?: ExpenseDTO | ExpenseDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
