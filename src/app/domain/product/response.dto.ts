import { ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../../model/product.entity';
import { BaseResponse } from '../common/base-response.dto';
import { ProductDTO } from './product.dto';
import { ProductResponseMapper } from './response.mapper';

export class ProductResponse extends BaseResponse {
  constructor(data?: Partial<Product | Product[]>) {
    super();
    if (data) {
      this.data = ProductResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => [ProductDTO] })
  data?: ProductDTO | ProductDTO[] = null;
}
