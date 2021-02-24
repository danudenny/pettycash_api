import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { TaxDTO } from './tax.dto';
import { TaxResponseMapper } from './tax-response.mapper.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';

export class TaxResponse extends BaseResponse {
  constructor(data?: Partial<TaxDTO | TaxDTO[]>) {
    super();
    if (data) {
      this.data = TaxResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [TaxDTO] })
  data?: TaxDTO | TaxDTO[] = null;
}

export class TaxWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<TaxDTO | TaxDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = TaxResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [TaxDTO] })
  data?: TaxDTO | TaxDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
