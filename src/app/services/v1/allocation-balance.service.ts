import { InjectRepository } from '@nestjs/typeorm';
import { CashBalanceAllocation } from '../../../model/cash.balance.allocation.entity';
import { Repository } from 'typeorm';
import { AllocationBalanceResponse, AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response.dto';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/allocation-balance.query.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AllocationBalanceService {

  constructor(
    @InjectRepository(CashBalanceAllocation)
    private readonly cashbalRepo: Repository<CashBalanceAllocation>
  ) {}

  public async list(
    query: AllocationBalanceQueryDTO,
  ): Promise<AllocationBalanceWithPaginationResponse> {
    const params = { order: '^number', limit: 10, ...query };
    const qb = new QueryBuilder(CashBalanceAllocation, 'cba', params);

    qb.fieldResolverMap['createdDate'] = 'cba.createdDate';
    qb.fieldResolverMap['branchId'] = 'cba.branchId';
    qb.fieldResolverMap['state'] = 'cba.state';
    qb.fieldResolverMap['number__contains'] = 'cba.number';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['cba.id', 'id'],
      ['cba.branch_id', 'branchId'],
      ['br.branch_name', 'branchName'],
      ['cba.number', 'number'],
      ['cba.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'picName'],
      ['cba.state', 'state'],
      ['cba.received_date', 'receivedDate'],
      ['cba.received_user_id', 'receivedUserId'],
      ['us.first_name', 'receivedUserName'],
    );
    qb.leftJoin(
      (e) => e.branch,
      'br'
    );
    qb.leftJoin(
      (e) => e.responsibleUser,
      'us'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const allocationBalance = await qb.exec();
    return new AllocationBalanceWithPaginationResponse(allocationBalance)
  }

  public async find(id: string): Promise<AllocationBalanceResponse> {
    const allocBalance = await this.cashbalRepo.findOne({
      where: {
        id,
        isDeleted: false,
      }
    })
    if (!allocBalance) {
      throw new BadRequestException('Alokasi Saldo Kas tidak Ditemukan!')
    }
    return new AllocationBalanceResponse(allocBalance)
  }
}
