import { Injectable } from '@nestjs/common';
import { BalanceWithPaginationResponse } from '../../domain/balance/response.dto';
import { QueryReportBalanceDTO } from '../../domain/balance/balance.query.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../model/branch.entity';
import { AuthService } from './auth.service';

@Injectable()
export class ReportBalanceService {

	constructor() {}

	public async getBalanceReport(query?: QueryReportBalanceDTO): Promise<BalanceWithPaginationResponse> {
		const params = { limit: 10, ...query };
		const qb = new QueryBuilder(Branch, 'b', params);
		const user = await AuthService.getUser({ relations: ['branches'] });
		const userBranches = user?.branches?.map((v) => v.id);

		qb.fieldResolverMap['balanceDate__gte'] = 'bgt.start_date';
		qb.fieldResolverMap['balanceDate__lte'] = 'bgt.end_date';
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
        WHERE b2.state = 'approved_by_spv' AND b2.is_deleted IS FALSE
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
			`(bgt.state = 'approved_by_spv')`,
		);
		if (userBranches?.length) {
			qb.andWhere(
				(e) => e.id,
				(v) => v.in(userBranches),
			);
		}

		// FIXME: use order from query params
		qb.qb.orderBy('difference_amount', 'DESC');

		const result = await qb.exec();
		return new BalanceWithPaginationResponse(result)
	}

}
