import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { Product } from '../../../../model/product.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryProductDTO } from '../../../domain/product/product.payload.dto';
import {
  ProductResponse,
  ProductWithPaginationResponse,
} from '../../../domain/product/response.dto';
import { CreateProductDTO } from '../../../domain/product/create-product.dto';
import UpdateProductDTO from '../../../domain/product/update-product.dto';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../../../../shared/errors';
import { GenerateCode } from '../../../../common/services/generate-code.service';
import { AuthService } from '../../v1/auth.service';
import { ExpenseItem } from '../../../../model/expense-item.entity';
import { DownPayment } from '../../../../model/down-payment.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  public async list(
    query?: QueryProductDTO,
  ): Promise<ProductWithPaginationResponse> {
    const params = { order: '^code', limit: 10, ...query };
    const qb = new QueryBuilder(Product, 'prod', params);

    qb.fieldResolverMap['code__icontains'] = 'prod.code';
    qb.fieldResolverMap['name__icontains'] = 'prod.name';
    qb.fieldResolverMap['isHasTax'] = 'prod.isHasTax';
    qb.fieldResolverMap['taxType'] = 'prod.taxType';
    qb.fieldResolverMap['type'] = 'prod.type';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['prod.id', 'id'],
      ['prod.code', 'code'],
      ['prod.name', 'name'],
      ['prod.description', 'description'],
      ['prod.is_has_tax', 'isHasTax'],
      ['prod.amount', 'amount'],
      ['prod.is_has_km', 'isHasKm'],
      ['prod.type', 'type'],
      ['prod.coa_id', 'coaId'],
      ['coa.code', 'coaCode'],
      ['coa.name', 'coaName'],
      ['prod.is_active', 'isActive'],
      ['prod.tax_type', 'taxType'],
    );
    qb.leftJoin((e) => e.coaProduct, 'coa');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const products = await qb.exec();
    return new ProductWithPaginationResponse(products, params);
  }

  public async create(data: CreateProductDTO): Promise<ProductResponse> {
    const prodDto = await this.productRepo.create(data);
    const prodExist = await this.productRepo.findOne({
      name: prodDto.name,
      isDeleted: false,
    });
    prodDto.createUserId = await ProductService.getUserId();
    prodDto.updateUserId = await ProductService.getUserId();
    prodDto.code = GenerateCode.product();

    if (!prodDto.name) {
      throw new BadRequestException(`Nama produk tidak boleh kosong!`);
    }

    if (prodExist) {
      throw new BadRequestException(`Nama produk sudah terdaftar!`);
    }

    try {
      const product = await this.productRepo.save(prodDto);
      return new ProductResponse(product);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(`Nama produk sudah terdaftar!`);
      }
      throw err;
    }
  }

  public async update(
    id: string,
    data: UpdateProductDTO,
  ): Promise<ProductResponse> {
    const product = await this.productRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!product) {
      throw new NotFoundException(`Produk ID ${id} not found!`);
    }

    const allowedFieldToUpdate = ['name'];
    let isAllowUpdate = true;
    for (const [k, v] of Object.entries(data)) {
      if (!allowedFieldToUpdate.includes(k)) {
        if (product[k] != v) {
          isAllowUpdate = false;
          break;
        }
      }
    }

    if (!isAllowUpdate) {
      // Check if Product already used in ExpenseItem
      const exp = await getManager().query(
        `SELECT id FROM expense_item WHERE product_id = $1 AND is_deleted IS FALSE`,
        [id],
      );
      if (exp?.length > 0) {
        throw new UnprocessableEntityException(
          `Product already used in ExpenseItem, only allow to update field: ${allowedFieldToUpdate.toString()}!`,
        );
      }

      // Check if Product already used in DownPayment
      const dp = await getManager().query(
        `SELECT id FROM down_payment WHERE product_id = $1 AND is_deleted IS FALSE`,
        [id],
      );
      if (dp?.length > 0) {
        throw new UnprocessableEntityException(
          `Product already used in DownPayment, only allow to update field: ${allowedFieldToUpdate.toString()}!`,
        );
      }
    }

    const updatedProduct = this.productRepo.create(data as Product);
    updatedProduct.updatedAt = new Date();
    updatedProduct.updateUserId = await ProductService.getUserId();

    try {
      await this.productRepo.update(id, updatedProduct);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(`Nama product sudah pernah dibuat`);
      }
      throw err;
    }
    return new ProductResponse();
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

  public async voucher(): Promise<ProductWithPaginationResponse> {
    const params = { order: '^code', limit: 10 };
    const qb = new QueryBuilder(Product, 'prod', params);

    qb.applyFilterPagination();
    qb.selectRaw(
      ['prod.id', 'id'],
      ['prod.code', 'code'],
      ['prod.name', 'name'],
      ['prod.description', 'description'],
      ['prod.is_has_tax', 'isHasTax'],
      ['prod.amount', 'amount'],
      ['prod.is_has_km', 'isHasKm'],
      ['prod.type', 'type'],
      ['prod.coa_id', 'coaId'],
      ['prod.is_active', 'isActive'],
      ['prod.tax_type', 'taxType'],
    );
    qb.andWhere(
      (e) => e.code,
      (v) => v.beginsWith('VCR'),
    );
    qb.andWhere(
      (e) => e.isActive,
      (v) => v.isTrue(),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.qb.cache('pettycash:voucher:products', 1000 * 60 * 60);

    const products = await qb.exec();
    return new ProductWithPaginationResponse(products, params);
  }
}
