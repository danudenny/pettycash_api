import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { QueryReportBalanceDTO } from '../../domain/balance/balance.query.dto';
import { ReportBalancePaginationResponse } from '../../domain/report-balance/response/report-balance-response.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../model/branch.entity';
import { AuthService } from './auth.service';

@Injectable()
export class ReportBalanceService {

	constructor() {}

	public async getBalanceReport(
		query?: QueryReportBalanceDTO,
	): Promise<ReportBalancePaginationResponse> {
		const params = { ...query };
		const balances = await this.getSummaryBalances(params);
		return new ReportBalancePaginationResponse(balances);
	}

	private async getSummaryBalances(
		query?: QueryReportBalanceDTO,
	): Promise<any> {
		const qb = new QueryBuilder(Branch, 'b', {});
		const user = await AuthService.getUser({ relations: ['branches'] });
		const userBranches = user?.branches?.map((v) => v.id);

		if (!userBranches?.length) {
			throw new UnprocessableEntityException(
				`Current User request not assigned to a branch!`,
			);
		}

		qb.selectRaw(
			['b.id', 'branchId'],
			['b.branch_name', 'branchName'],
			['COALESCE(acc_bank.balance, 0)', 'bankAmount'],
			['COALESCE(acc_cash.balance, 0)', 'cashAmount'],
			[
				'(COALESCE(acc_bank.balance, 0) + COALESCE(acc_cash.balance, 0))',
				'totalAmount',
			]
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
          ((b2.end_date - b2.start_date) + 1) AS total_day,
          b2.total_amount
        FROM budget b2
        WHERE b2.state = 'approved_by_spv' AND b2.is_deleted IS FALSE
        ORDER BY b2.end_date DESC
        LIMIT 1
      )
      SELECT
        branch_id,
        total_day,
        start_date,
        end_date,
        state
      FROM x_budget)`,
			'bgt',
			'bgt.branch_id = b.id',
		);
		qb.qb.andWhere(
			`(bgt.state = 'approved_by_spv')`,
		);
		qb.andWhere(
			(e) => e.id,
			(v) => v.in(userBranches),
		);

		return await qb.exec();
	}

}
