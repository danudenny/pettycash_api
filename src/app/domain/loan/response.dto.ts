import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { LoanDTO } from './loan.dto';
import { LoanResponseMapper } from './response.mapper';

export class LoanWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<LoanDTO | LoanDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = LoanResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [LoanDTO] })
  data?: LoanDTO | LoanDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
