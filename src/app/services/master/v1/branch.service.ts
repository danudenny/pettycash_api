import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../../model/branch.entity';
import { QueryBranchDTO } from '../../../domain/branch/branch.query.dto';
import { BranchWithPaginationResponse } from '../../../domain/branch/response.dto';
import { AuthService } from '../../v1/auth.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
  ) {}

  public async list(query: QueryBranchDTO, branchIds?: string[]): Promise<any> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Branch, 'b', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['name__icontains'] = 'b.branch_name';
    qb.fieldResolverMap['code__icontains'] = 'b.branch_code';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['b.id', 'id'],
      ['b.branch_name', 'name'],
      ['b.branch_code', 'code'],
      ['b.cash_coa_id', 'coaId'],
    );
    qb.andWhere(
      (e) => e.isActive,
      (v) => v.isTrue(),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    if (userBranchIds?.length && !isSuperUser && !branchIds?.length) {
      qb.andWhere(
        (e) => e.id,
        (v) => v.in(userBranchIds),
      );
    }
    if (branchIds?.length) {
      qb.andWhere(
        (e) => e.id,
        (v) => v.in(branchIds),
      );
    }

    const branch = await qb.exec();
    return new BranchWithPaginationResponse(branch, params);
  }

  /**
   * List all branch for budget
   * filter only branch that's doesn't have budget.
   *
   * @param {QueryBranchDTO} query
   * @return {*}  {Promise<any>}
   * @memberof BranchService
   */
  public async listForBudget(query: QueryBranchDTO): Promise<any> {
    const { userBranchIds } = await AuthService.getUserBranchAndRole();

    if (!userBranchIds?.length) {
      return await this.list(query);
    }

    const budgetBranchSql = `SELECT b.branch_id
    FROM budget b
    WHERE b.branch_id = ANY($1) AND b.is_deleted IS FALSE
    GROUP BY b.branch_id;`;
    const budgetBranches = (await getManager().query(budgetBranchSql, [
      userBranchIds,
    ])) as any[];
    const mbudgetBranches = budgetBranches.map((b) => b.branch_id);

    if (!mbudgetBranches?.length) {
      return await this.list(query);
    }

    const branchNoBudget = userBranchIds.filter(
      (branch) => !mbudgetBranches.includes(branch),
    );
    return await this.list(query, branchNoBudget);
  }

  public static async processQueueData(data: any) {
    // TODO: Process Queue data
  }
}
