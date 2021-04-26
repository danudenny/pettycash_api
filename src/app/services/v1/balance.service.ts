import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { AccountStatement } from '../../../model/account-statement.entity';
import { Branch } from '../../../model/branch.entity';
import { QueryBalanceDTO } from '../../domain/balance/balance.query.dto';
import { BalanceWithPaginationResponse } from '../../domain/balance/response.dto';
import { CashBalanceAllocation } from '../../../model/cash.balance.allocation.entity';
import { AuthService } from './auth.service';
import { parseBool } from '../../../shared/utils/parser';
import { QuerySummaryBalanceDTO } from '../../domain/balance/summary-balance.query.dto';
import { LoaderEnv } from '../../../config/loader';
import { BalanceSummaryResponse } from '../../domain/balance/summary-response.dto';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(AccountStatement)
    private readonly repoStatement: Repository<AccountStatement>,
    @InjectRepository(CashBalanceAllocation)
    private readonly allocationRepo: Repository<CashBalanceAllocation>,
  ) {}

  private async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  public async list(
    query: QueryBalanceDTO,
  ): Promise<BalanceWithPaginationResponse> {
    const params = { limit: 10, ...query };
    const balances = await this.getBalances(params);
    return new BalanceWithPaginationResponse(balances, params);
  }

  /**
   * Get Summary balances of branch.
   *
   * @param {*} [query] {QuerySummaryBalanceDTO}
   * @return {*}  {Promise<BalanceSummaryResponse>}
   * @memberof BalanceService
   */
  public async getSummary(
    query?: QuerySummaryBalanceDTO,
  ): Promise<BalanceSummaryResponse> {
    const params = { ...query };
    const balances = await this.getSummaryBalances(params);
    return new BalanceSummaryResponse(balances);
  }

  private async getBalances(query?: QueryBalanceDTO): Promise<any> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Branch, 'b', params);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranches = user?.branches?.map((v) => v.id);

    qb.fieldResolverMap['branchId'] = 'b.id';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['b.id', 'branch_id'],
      ['b.branch_name', 'branch_name'],
      ['COALESCE(act.balance, 0)', 'current_balance'],
      ['COALESCE(bgt.minimum_amount, 0)', 'minimum_amount'],
      ['COALESCE(bgt.total_budget, 0)', 'budget_amount'],
      ['COALESCE((act.balance - bgt.minimum_amount), 0)', 'difference_amount'],
      ['bgt.state', 'budget_state'],
      ['now()', 'now'],
    );
    qb.qb.leftJoin(
      `(WITH acc_stt AS (
          SELECT
            as2.branch_id,
            CASE WHEN as2.amount_position = 'debit' THEN COALESCE(SUM(amount), 0) END AS debit,
            CASE WHEN as2.amount_position = 'credit' THEN COALESCE(SUM(amount), 0) END AS credit
            FROM account_statement as2
            WHERE as2.is_deleted IS FALSE
            GROUP BY as2.branch_id, as2.amount_position
      )
      SELECT
        branch_id,
        (COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)) AS balance
      FROM acc_stt
      GROUP BY branch_id)`,
      'act',
      'act.branch_id = b.id',
    );
    qb.qb.leftJoin(
      `(
      WITH x_budget AS (
        SELECT
          b2.branch_id,
          b2.start_date, b2.end_date,
          b2.state,
          ((b2.end_date - b2.start_date) + 1) AS total_day, b2.total_amount,
          ((b2.total_amount / ((b2.end_date - b2.start_date) + 1) * 2)) AS minimum_amount,
          ((((b2.total_amount / ((b2.end_date - b2.start_date) + 1) * 2)) / 2) * 7) AS total_budget
        FROM budget b2
        WHERE (b2.state = 'confirmed_by_ss' OR b2.state = 'approved_by_spv')
              AND b2.is_deleted IS FALSE
        ORDER BY b2.end_date DESC
        LIMIT 1
      )
      SELECT
        branch_id,
        total_day,
        minimum_amount,
        total_budget,
        start_date,
        end_date,
        state
      FROM x_budget
    )`,
      'bgt',
      'bgt.branch_id = b.id',
    );
    qb.qb.andWhere(
      `(bgt.state = 'confirmed_by_ss' OR bgt.state = 'approved_by_spv')`,
    );
    if (userBranches?.length) {
      qb.andWhere(
        (e) => e.id,
        (v) => v.in(userBranches),
      );
    }
    if (params.balanceDate__lte) {
      qb.qb.andWhere(
        `(:balanceDate >= bgt.start_date AND :balanceDate <= bgt.end_date)`,
        { balanceDate: params.balanceDate__lte },
      );
    }

    if (params.state) {
      let op = '<';
      switch (params.state) {
        case 'lessThan':
          op = '<';
          break;
        case 'equal':
          op = '=';
          break;
        case 'moreThan':
          op = '>';
          break;
      }
      const stateSql = `(COALESCE((act.balance - bgt.minimum_amount), 0) ${op} 0)`;
      qb.qb.andWhere(stateSql);
    }
    // FIXME: use order from query params
    qb.qb.orderBy('difference_amount', 'DESC');

    const result = await qb.exec();
    return result;
  }

  private async getSummaryBalances(
    query?: QuerySummaryBalanceDTO,
  ): Promise<any> {
    const qb = new QueryBuilder(Branch, 'b', {});
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranches = user?.branches?.map((v) => v.id);

    if (!userBranches?.length) {
      throw new UnprocessableEntityException(
        `Current User request not assigned to a branch!`,
      );
    }

    const cacheKey = `branch_balance_${userBranches[0]}`;
    if (parseBool(query?.noCache)) {
      await getConnection().queryResultCache?.remove([cacheKey]);
    }

    qb.selectRaw(
      ['b.id', 'branchId'],
      ['b.branch_name', 'branchName'],
      ['COALESCE(acc_bank.balance, 0)', 'bankAmount'],
      ['COALESCE(acc_cash.balance, 0)', 'cashAmount'],
      [
        '(COALESCE(acc_bank.balance, 0) + COALESCE(acc_cash.balance, 0))',
        'totalAmount',
      ],
      ['COALESCE(bgt.minimum_amount, 0)', 'minimumAmount'],
      ['now()', 'retreiveAt'],
    );
    qb.qb.leftJoin(
      `(WITH acc_stt_bank AS (
          SELECT
            as2.branch_id,
            CASE
              WHEN as2.amount_position = 'debit' THEN COALESCE(SUM(amount), 0)
            END AS debit,
            CASE
              WHEN as2.amount_position = 'credit' THEN COALESCE(SUM(amount), 0)
            END AS credit
          FROM
            account_statement as2
          WHERE as2."type" = 'bank' AND as2.is_deleted IS FALSE
          GROUP BY
            as2.branch_id,
            as2.amount_position
        )
        SELECT
          branch_id,
          (COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)) AS balance
        FROM
          acc_stt_bank
        GROUP BY
          branch_id
      )`,
      'acc_bank',
      'acc_bank.branch_id = b.id',
    );
    qb.qb.leftJoin(
      `(WITH acc_stt_cash AS (
          SELECT
            as2.branch_id,
            CASE
              WHEN as2.amount_position = 'debit' THEN COALESCE(SUM(amount), 0)
            END AS debit,
            CASE
              WHEN as2.amount_position = 'credit' THEN COALESCE(SUM(amount), 0)
            END AS credit
          FROM
            account_statement as2
          WHERE as2."type" = 'cash' AND as2.is_deleted IS FALSE
          GROUP BY
            as2.branch_id,
            as2.amount_position
        )
        SELECT
          branch_id,
          (COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)) AS balance
        FROM
        acc_stt_cash
        GROUP BY
          branch_id
      )`,
      'acc_cash',
      'acc_cash.branch_id = b.id',
    );
    qb.qb.leftJoin(
      `(WITH x_budget AS (
        SELECT
          b2.branch_id,
          b2.start_date, b2.end_date,
          b2.state,
          ((b2.end_date - b2.start_date) + 1) AS total_day, b2.total_amount,
          ((b2.total_amount / ((b2.end_date - b2.start_date) + 1) * 2)) AS minimum_amount
        FROM budget b2
        WHERE (b2.state = 'confirmed_by_ss' OR b2.state = 'approved_by_spv')
              AND b2.is_deleted IS FALSE
        ORDER BY b2.end_date DESC
        LIMIT 1
      )
      SELECT
        branch_id,
        total_day,
        minimum_amount,
        start_date,
        end_date,
        state
      FROM x_budget)`,
      'bgt',
      'bgt.branch_id = b.id',
    );
    qb.qb.andWhere(
      `(bgt.state = 'confirmed_by_ss' OR bgt.state = 'approved_by_spv')`,
    );
    qb.andWhere(
      (e) => e.id,
      (v) => v.in(userBranches),
    );
    qb.qb.cache(
      cacheKey,
      LoaderEnv.envs.CACHE_BRANCH_BALANCE_DURATION_IN_MINUTES * 60000,
    );

    const result = await qb.exec();
    return result;
  }
}
