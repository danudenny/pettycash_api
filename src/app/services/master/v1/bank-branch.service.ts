import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { BankBranch } from '../../../../model/bank-branch.entity';
import { QueryBankBranchDTO } from '../../../domain/bank-branch/bank-branch.query.dto';
import { BankBranchWithPaginationResponse } from '../../../domain/bank-branch/response.dto';
import { AuthService } from '../../v1/auth.service';

@Injectable()
export class BankBranchService {
  constructor(
    @InjectRepository(BankBranch)
    private readonly repo: Repository<BankBranch>,
  ) {}

  public async list(query: QueryBankBranchDTO): Promise<any> {
    const params = { ...query };
    const qb = new QueryBuilder(BankBranch, 'b', params);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userLegacyBranchIds = user?.branches?.map((v) => v.branchId);

    qb.fieldResolverMap['bankName__icontains'] = 'b.bank_name';
    qb.fieldResolverMap['accountNumber__icontains'] = 'b.account_number';
    qb.fieldResolverMap['accountHolderName__icontains'] = 'b.account_holder_name';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['b.id', 'id'],
      ['b.bank_name', 'bankName'],
      ['b.account_number', 'accountNumber'],
      ['b.account_holder_name', 'accountHolderName'],
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    if (userLegacyBranchIds?.length) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userLegacyBranchIds),
      );
    }

    const banks = await qb.exec();
    return new BankBranchWithPaginationResponse(banks, params);
  }

  public static async processQueueData(data: any) {
    // TODO: Process Queue data
  }
}
