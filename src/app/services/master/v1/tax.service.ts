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
import { AuthService } from '../../v1/auth.service';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(AccountTax)
    private readonly taxRepo: Repository<AccountTax>,
  ) {}

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  public async list(query?: QueryTaxDTO): Promise<TaxWithPaginationResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(AccountTax, 'tax', params);

    qb.fieldResolverMap['name__icontains'] = 'tax.name';
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
    const taxExist = await this.taxRepo.findOne({name: taxDto.name, isDeleted: false})
    taxDto.createUserId = await TaxService.getUserId();
    taxDto.updateUserId = await TaxService.getUserId();

    if(!taxDto.name) {
      throw new BadRequestException(
        `Nama pajak tidak boleh kosong!`,
      );
    }

    if(taxExist) {
      throw new BadRequestException(`Nama pajak sudah terdaftar!`);
    }


    try {
      const tax = await this.taxRepo.save(taxDto);
      return new TaxResponse(tax);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(`Nama pajak sudah terdaftar!`);
      }
      throw err;
    }

  }

  public async update(id: string, data: UpdateTaxDTO): Promise<TaxResponse> {
    const tax = await this.taxRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!tax) {
      throw new NotFoundException(`Tax ID ${id} tidak ditemukan!`);
    }

    const updatedTax = this.taxRepo.create(data as AccountTax);
    updatedTax.updateUserId = await TaxService.getUserId();

    try {
      const taxSave = this.taxRepo.update(id, updatedTax);
      return new TaxResponse(taxSave as any);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(
          `Nama pajak sudah pernah dibuat`,
        );
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
