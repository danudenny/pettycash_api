import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductService } from '../../../services/master/v1/product.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProductResponse } from '../../../domain/product/response.dto';
import { QueryProductDTO } from '../../../domain/product/product.payload.dto';
import { CreateProductDTO } from '../../../domain/product/create-product.dto';
import UpdateProductDTO from '../../../domain/product/update-product.dto';
import FindIdParams from '../../../domain/common/findId-param.dto';

@Controller('v1/products')
@ApiTags('Products')
export class ProductsController {
  constructor(private prodService: ProductService) {}

  @Get('')
  @ApiOperation({ summary: 'List all Products' })
  @ApiOkResponse({ type: ProductResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryProductDTO){
    return await this.prodService.list(query);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Product' })
  @ApiOkResponse({ type: ProductResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async create(@Body() payload: CreateProductDTO) {
    return await this.prodService.create(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Product' })
  @ApiOkResponse({ type: ProductResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async update(
    @Param() { id }: FindIdParams,
    @Body() payload: UpdateProductDTO,
  ) {
    return await this.prodService.update(id, payload);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete Product' })
  @ApiOkResponse({ type: ProductResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.prodService.delete(id);
  }
}
