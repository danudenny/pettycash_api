import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTax } from '../../../../model/account-tax.entity';
import { TaxResponse } from '../../../domain/tax/tax-response.dto';
import { QueryTaxDTO } from '../../../domain/tax/tax.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { CreateTaxDTO } from '../../../domain/tax/create-tax.dto';
import { UpdateTaxDTO } from '../../../domain/tax/update-tax.dto';

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

  public async list(query?: QueryTaxDTO): Promise<TaxResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(AccountTax, 'tax', params);

    qb.fieldResolverMap['name__contains'] = 'tax.name';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['tax.id', 'id'],
      ['tax.name', 'name'],
      ['tax.is_has_npwp', 'isHasNpwp'],
      ['tax.tax_in_percent', 'taxInPercent'],
      ['tax.partner_type', 'partnerType'],
      ['tax.coa_id', 'coaId'],
      ['tax.is_deleted', 'isDeleted']
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const taxes = await qb.exec();
    return new TaxResponse(taxes);
  }

  public async create(data: CreateTaxDTO): Promise<TaxResponse> {
    const taxDto = await this.taxRepo.create(data);
    taxDto.createUserId = await this.getUserId();
    taxDto.updateUserId = await this.getUserId();

    const tax = await this.taxRepo.save(taxDto);
    return new TaxResponse(tax);
  }

  public async update(id: string, data: UpdateTaxDTO): Promise<TaxResponse> {
    const taxExist = await this.taxRepo.findOne({ id, isDeleted: false });
    if (!taxExist) {
      throw new NotFoundException();
    }
    const values = await this.taxRepo.create(data);
    values.updateUserId = await this.getUserId();

    const tax = await this.taxRepo.update(id, values);
    return new TaxResponse(tax as any);
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
