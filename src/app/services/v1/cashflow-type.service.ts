import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CashflowType } from '../../../model/cashflow-type.entity';
import { Repository } from 'typeorm';
import { QueryCashFlowTypeDTO } from '../../domain/cashflow-type/cashflow-type-query.dto';
import { CashflowTypeWithPaginationResponse } from '../../domain/cashflow-type/cashflow-type-response.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { CreateCashflowTypeDto } from '../../domain/cashflow-type/cashflow-type-create.dto';
import { AuthService } from './auth.service';
import { AccountCoa } from '../../../model/account-coa.entity';

@Injectable()
export class CashflowTypeService {

  constructor(
    @InjectRepository(CashflowType)
    private readonly cashflowRepo: Repository<CashflowType>,
    @InjectRepository(AccountCoa)
    private readonly coaRepo: Repository<AccountCoa>
  ) {}

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  public async list(query?: QueryCashFlowTypeDTO): Promise<CashflowTypeWithPaginationResponse> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(CashflowType, 'cft', params);

    qb.fieldResolverMap['name__icontains'] = 'cft.name';
    qb.fieldResolverMap['coaId'] = 'cft.coa_id';
    qb.fieldResolverMap['isActive'] = 'cft.is_active';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['cft.id', 'id'],
      ['cft.name', 'name'],
      ['coa.code', 'coaCode'],
      ['cft.is_active', 'isActive']
    );
    qb.leftJoin(
      (e) => e.coaProduct,
      'coa'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const cashflowType = await qb.exec();
    return new CashflowTypeWithPaginationResponse(cashflowType, params)
  }

  public async create(payload: CreateCashflowTypeDto): Promise<any> {
    const cashflowDto = await this.cashflowRepo.create(payload);
    const cashflowExist = await this.cashflowRepo.findOne({
      name: cashflowDto.name,
      isDeleted: false
    })
    const checkCoaId = await this.coaRepo.findOne({
      id: cashflowDto.coaId
    })

    if(!checkCoaId) {
      throw new HttpException("Akun COA tidak ditemukan", HttpStatus.BAD_REQUEST)
    }

    if(!cashflowDto.name) {
      throw new BadRequestException(
        `Nama Kas Masuk tidak boleh kosong!`,
      );
    }

    if(cashflowExist) {
      throw new BadRequestException(`Nama kas masuk sudah terdaftar!`);
    }

    cashflowDto.createUserId = await CashflowTypeService.getUserId();
    cashflowDto.updateUserId = await CashflowTypeService.getUserId();

    try {
      await this.cashflowRepo.save(cashflowDto);
      return new HttpException("Berhasil menambahkan kas masuk.", HttpStatus.OK)
    } catch (err) {
      throw err;
    }
  }

  public async update(id: string, data: CreateCashflowTypeDto): Promise<any> {
    const getcashFlow = await this.cashflowRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!getcashFlow) {
      throw new NotFoundException(`Kas Masuk dengan ID : ${id} tidak ditemukan!`);
    }

    const updatedCashFlow = this.cashflowRepo.create(data as CashflowType);
    updatedCashFlow.updateUserId = await CashflowTypeService.getUserId();

    try {
      await this.cashflowRepo.update(id, updatedCashFlow);
      return new HttpException("Berhasil update kas masuk.", HttpStatus.OK)
    } catch (err) {
      throw err;
    }

  }

  public async delete(id: string): Promise<any> {
    const cashflowExists = await this.cashflowRepo.findOne({ id, isDeleted: false });
    if (!cashflowExists) {
      throw new NotFoundException();
    }

    // SoftDelete
    const cashflowDelete = await this.cashflowRepo.update(id, { isDeleted: true });
    if (!cashflowDelete) {
      throw new BadRequestException();
    }

    return new HttpException("Berhasil menghapus kas masuk.", HttpStatus.OK)
  }
}