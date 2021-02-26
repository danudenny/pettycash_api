import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTax } from '../../../../model/account-tax.entity';
import { TaxResponse, TaxWithPaginationResponse } from '../../../domain/tax/tax-response.dto';
import { QueryTaxDTO } from '../../../domain/tax/tax.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { CreateTaxDTO } from '../../../domain/tax/create-tax.dto';
import { UpdateTaxDTO } from '../../../domain/tax/update-tax.dto';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../../../../shared/errors';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(AccountTax)
    private readonly taxRepo: Repository<AccountTax>,
  ) {}

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

  public async list(query?: QueryTaxDTO): Promise<TaxWithPaginationResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(AccountTax, 'tax', params);

    qb.fieldResolverMap['name__contains'] = 'tax.name';
    qb.fieldResolverMap['partnerType'] = 'tax.partnerType';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['tax.id', 'id'],
      ['tax.name', 'name'],
      ['tax.is_has_npwp', 'isHasNpwp'],
      ['tax.tax_in_percent', 'taxInPercent'],
      ['tax.partner_type', 'partnerType'],
      ['tax.coa_id', 'coaId'],
      ['coa.name', 'coaName'],
      ['coa.code', 'coaCode'],
      ['tax.is_deleted', 'isDeleted']
    );
    qb.leftJoin(
      (e) => e.coa,
      'coa'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const taxes = await qb.exec();
    return new TaxWithPaginationResponse(taxes, params);
  }

  public async create(data: CreateTaxDTO): Promise<TaxResponse> {
    const taxDto = await this.taxRepo.create(data);
    taxDto.createUserId = await this.getUserId();
    taxDto.updateUserId = await this.getUserId();

    try {
      const tax = await this.taxRepo.save(taxDto);
      return new TaxResponse(tax);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(`Name should be unique!`);
      }
      throw err;
    }

  }

  public async update(id: string, data: UpdateTaxDTO): Promise<TaxResponse> {
    const taxExist = await this.taxRepo.findOne({ id, isDeleted: false });
    if (!taxExist) {
      throw new NotFoundException();
    }
    const values = await this.taxRepo.create(data);
    values.updateUserId = await this.getUserId();

    try {
      const tax = await this.taxRepo.update(id, values);
      return new TaxResponse(tax as any);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(`Name should be unique!`);
      }
      throw err;
    }

  }

  public async delete(id: string): Promise<any> {
    const taxExists = await this.taxRepo.findOne({ id, isDeleted: false });
    if (!taxExists) {
      throw new NotFoundException();
    }

    // SoftDelete
    const tax = await this.taxRepo.update(id, { isDeleted: true });
    if (!tax) {
      throw new BadRequestException();
    }

    return new TaxResponse();
  }
}
