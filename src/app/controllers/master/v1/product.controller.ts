import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from '../../../services/master/v1/product.service';
import { Product } from '../../../../model/product.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('v1/products')
@ApiTags('Products')
export class ProductsController {

  constructor (private prodService: ProductService) {}

  @Get('')
  public async list(@Query() query: any): Promise<Product[]> {
    return await this.prodService.list(query);
  }
}
