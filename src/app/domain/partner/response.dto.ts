import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { PartnerDTO } from './partner.dto';
import { PartnerResponseMapper } from './response.mapper';

export class PartnerResponse extends BaseResponse {
  constructor(data?: Partial<PartnerDTO | PartnerDTO[]>) {
    super();
    if (data) {
      this.data = PartnerResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => PartnerDTO })
  data?: PartnerDTO | PartnerDTO[] = null;
}

export class PartnerWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<PartnerDTO | PartnerDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = PartnerResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [PartnerDTO] })
  data?: PartnerDTO | PartnerDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
