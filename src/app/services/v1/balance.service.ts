import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { AccountStatement } from '../../../model/account-statement.entity';
import { Branch } from '../../../model/branch.entity';
import { QueryBalanceDTO } from '../../domain/balance/balance.query.dto';
import { BalanceWithPaginationResponse } from '../../domain/balance/response.dto';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(AccountStatement)
    private readonly repoStatement: Repository<AccountStatement>,
  ) {}

  public async list(
    query: QueryBalanceDTO,
  ): Promise<BalanceWithPaginationResponse> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Branch, 'b', params);

    qb.fieldResolverMap['branchId'] = 'id';

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
           select
           as2.branch_id,
           CASE WHEN as2.amount_position = 'debit' THEN COALESCE(SUM(amount), 0) END AS debit,
           CASE WHEN as2.amount_position = 'credit' THEN COALESCE(SUM(amount), 0) END AS credit
           FROM account_statement as2
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
          (b2.end_date - b2.start_date) AS total_day, b2.total_amount,
          ((b2.total_amount / (b2.end_date - b2.start_date) * 2)) AS minimum_amount,
          ((((b2.total_amount / (b2.end_date - b2.start_date) * 2)) / 2) * 7) AS total_budget
        FROM budget b2
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
      `(bgt.state = 'approved_by_ss' OR bgt.state = 'approved_by_spv')`,
    );

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
    return new BalanceWithPaginationResponse(result, params);
  }
}
