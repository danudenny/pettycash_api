import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, In } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../../model/branch.entity';
import { QueryBranchDTO } from '../../../domain/branch/branch.query.dto';
import { BranchWithPaginationResponse } from '../../../domain/branch/response.dto';
import { UpdateBranchDTO } from '../../../domain/branch/update.dto';
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

  /**
   * Update Branch
   *
   * @param {string} id of Branch to update.
   * @param {UpdateBranchDTO} payload
   * @return {*}  {Promise<any>}
   * @memberof BranchService
   */
  public async update(id: string, payload: UpdateBranchDTO): Promise<any> {
    const {
      userBranchIds,
      isSuperUser,
      user,
    } = await AuthService.getUserBranchAndRole();

    const where = { id, isDeleted: false };
    if (!isSuperUser) {
      Object.assign(where, { branchId: In(userBranchIds) });
    }

    const branch = await this.repo.findOne(where);
    if (!branch) {
      throw new NotFoundException(
        `Branch with ID ${id} for user ${user?.username} not found!`,
      );
    }

    // Only allow to update cashCoaId
    if (payload?.coaId) {
      branch.cashCoaId = payload?.coaId;
      return await branch.save();
    }

    return;
  }

  /**
   * Helper for checking if the branch has CoA or not.
   *
   * @static
   * @param {string} branchId
   * @return {*}  {Promise<void>}
   * @memberof BranchService
   */
  public static async checkCashCoa(branchId: string): Promise<void> {
    const branch = await getManager()
      .getRepository(Branch)
      .findOne({
        where: { id: branchId, isDeleted: false },
        select: ['id', 'cashCoaId'],
      });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found!`);
    }

    if (!branch?.cashCoaId) {
      throw new UnprocessableEntityException(
        'Transaksi tidak dapat dilakukan karena Branch tidak memiliki CoA, ' +
          'Silakan set CoA terlebih dahulu pada Menu Branch di Master Data.',
      );
    }
  }

  public static async processQueueData(data: any) {
    // TODO: Process Queue data
  }
}
