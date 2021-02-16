import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../model/product.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryProductDTO } from '../../../domain/product/product.payload.dto';
import { ProductResponse } from '../../../domain/product/response.dto';
import { CreateProductDTO } from '../../../domain/product/create-product.dto';
import UpdateProductDTO from '../../../domain/product/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

  public async list(query?: QueryProductDTO): Promise<ProductResponse> {
    const params = { order: '^code', limit: 10, ...query };
    const qb = new QueryBuilder(Product, 'prod', params);

    qb.fieldResolverMap['code__contains'] = 'prod.code';
    qb.fieldResolverMap['name__contains'] = 'prod.name';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['prod.id', 'id'],
      ['prod.code', 'code'],
      ['prod.name', 'name'],
      ['prod.description', 'description'],
      ['prod.is_has_tax', 'isHasTax'],
      ['prod.amount', 'amount'],
      ['prod.coa_id', 'coaId'],
      ['prod.is_active', 'isActive'],
      ['prod.is_deleted', 'isDeleted']
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const products = await qb.exec();
    return new ProductResponse(products);
  }

  public async create(data: CreateProductDTO): Promise<ProductResponse> {
    const prodDto = await this.productRepo.create(data);
    prodDto.createUserId = await this.getUserId();
    prodDto.updateUserId = await this.getUserId();

    const product = await this.productRepo.save(prodDto);
    return new ProductResponse(product);
  }

  public async update(id: string, data: UpdateProductDTO): Promise<ProductResponse> {
    const prodExist = await this.productRepo.findOne({ id, isDeleted: false });
    if (!prodExist) {
      throw new NotFoundException();
    }
    const values = await this.productRepo.create(data);
    values.updateUserId = await this.getUserId();

    const product = await this.productRepo.update(id, values);
    return new ProductResponse(product as any);
  }

  public async delete(id: string): Promise<any> {
    const prodExist = await this.productRepo.findOne({ id, isDeleted: false });
    if (!prodExist) {
      throw new NotFoundException();
    }

    // SoftDelete
    const product = await this.productRepo.update(id, { isDeleted: true });
    if (!product) {
      throw new BadRequestException();
    }

    return new ProductResponse();
  }
}
