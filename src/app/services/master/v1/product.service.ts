import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../model/product.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryProductDTO } from '../../../domain/product/product.payload.dto';
import { ProductResponse, ProductWithPaginationResponse } from '../../../domain/product/response.dto';
import { CreateProductDTO } from '../../../domain/product/create-product.dto';
import UpdateProductDTO from '../../../domain/product/update-product.dto';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../../../../shared/errors';

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

  public async list(query?: QueryProductDTO): Promise<ProductWithPaginationResponse> {
    const params = { order: '^code', limit: 10, ...query };
    const qb = new QueryBuilder(Product, 'prod', params);

    qb.fieldResolverMap['code__contains'] = 'prod.code';
    qb.fieldResolverMap['name__contains'] = 'prod.name';
    qb.fieldResolverMap['isHasTax'] = 'prod.isHasTax';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['prod.id', 'id'],
      ['prod.code', 'code'],
      ['prod.name', 'name'],
      ['prod.description', 'description'],
      ['prod.is_has_tax', 'isHasTax'],
      ['prod.amount', 'amount'],
      ['prod.coa_id', 'coaId'],
      ['coa.code', 'coaCode'],
      ['coa.name', 'coaName'],
      ['prod.is_active', 'isActive'],
      ['prod.is_deleted', 'isDeleted']
    );
    qb.leftJoin(
      (e) => e.coaProduct,
      'coa'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const products = await qb.exec();
    return new ProductWithPaginationResponse(products, params);
  }

  public async create(data: CreateProductDTO): Promise<ProductResponse> {
    const prodDto = await this.productRepo.create(data);
    prodDto.createUserId = await this.getUserId();
    prodDto.updateUserId = await this.getUserId();

    try {
      const product = await this.productRepo.save(prodDto);
      return new ProductResponse(product);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(`name and code should be unique!`);
      }
      throw err;
    }

  }

  public async update(id: string, data: UpdateProductDTO): Promise<ProductResponse> {
    const prodExist = await this.productRepo.findOne({ id, isDeleted: false });
    if (!prodExist) {
      throw new NotFoundException();
    }
    const values = await this.productRepo.create(data);
    values.updateUserId = await this.getUserId();

    try {
      const product = await this.productRepo.update(id, values);
      return new ProductResponse(product as any);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(`name and code should be unique!`);
      }
      throw err;
    }

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
