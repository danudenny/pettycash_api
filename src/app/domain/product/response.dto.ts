import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { ProductDTO } from './product.dto';
import { ProductResponseMapper } from './response.mapper';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';

export class ProductResponse extends BaseResponse {
  constructor(data?: Partial<ProductDTO | ProductDTO[]>) {
    super();
    if (data) {
      this.data = ProductResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [ProductDTO] })
  data?: ProductDTO | ProductDTO[] = null;
}

export class ProductWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<ProductDTO | ProductDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = ProductResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [ProductDTO] })
  data?: ProductDTO | ProductDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
