import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { AccountCoaDTO } from './accounta-ca.dto';
import { AccountCoaResponseMapper } from './response.mapper';

export class AccountCoaResponse extends BaseResponse {
  constructor(data?: Partial<AccountCoaDTO | AccountCoaDTO[]>) {
    super();
    if (data) {
      this.data = AccountCoaResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [AccountCoaDTO] })
  data?: AccountCoaDTO | AccountCoaDTO[] = null;
}

export class AccountCoaWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<AccountCoaDTO | AccountCoaDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = AccountCoaResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [AccountCoaDTO] })
  data?: AccountCoaDTO | AccountCoaDTO[] = null;

  @ApiPropertyOptional()
  meta?: BasePaginationResponse;
}
