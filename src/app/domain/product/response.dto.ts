import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { ProductDTO } from './product.dto';
import { ProductResponseMapper } from './response.mapper';

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
