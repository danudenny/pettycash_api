import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../../common/base-pagination-response.dto';
import { BaseResponse } from '../../common/base-response.dto';
import { PaginationBuilder } from '../../common/pagination-builder';
import { AllocationBalanceResponseMapper } from '../response-mapper/reponse.mapper.dto';
import { AllocationBalanceDTO } from '../dto/allocation-balance.dto';

export class AllocationBalanceResponse extends BaseResponse {
  constructor(data?: Partial<AllocationBalanceDTO | AllocationBalanceDTO[]>) {
    super();
    if (data) {
      this.data = AllocationBalanceResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [AllocationBalanceDTO] })
  data?: AllocationBalanceDTO | AllocationBalanceDTO[] = null;
}

export class AllocationBalanceWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<AllocationBalanceDTO | AllocationBalanceDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = AllocationBalanceResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [AllocationBalanceDTO] })
  data?: AllocationBalanceDTO | AllocationBalanceDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
