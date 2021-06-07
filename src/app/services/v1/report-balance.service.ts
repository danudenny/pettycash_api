import { Response } from 'express';
import {
	HttpException,
	HttpStatus,
	Injectable,
	UnprocessableEntityException,
} from '@nestjs/common';
import { QueryReportBalanceDTO } from '../../domain/balance/balance.query.dto';
import { ReportBalancePaginationResponse } from '../../domain/report-balance/response/report-balance-response.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../model/branch.entity';
import { AuthService } from './auth.service';
import { ReportBalanceDTO } from '../../domain/report-balance/dto/report-balance.dto';
import dayjs from 'dayjs';
import { parseBool } from '../../../shared/utils';
import { getConnection } from 'typeorm';
import { LoaderEnv } from '../../../config/loader';

@Injectable()
export class ReportBalanceService {

	constructor() { }

	public async getBalanceReport(
		query?: QueryReportBalanceDTO,
	): Promise<ReportBalancePaginationResponse> {
		const params = { ...query };
		const balances = await this.getSummaryBalances(params);
		return new ReportBalancePaginationResponse(balances);
	}

	async export(res: Response, query: QueryReportBalanceDTO): Promise<Response> {
		try {
			const balances: Partial<ReportBalanceDTO[]> = await this.getSummaryBalances(query);
			const balancesReportFileName = this.createBalanceReportFilename();
			const balancesReportBuffer = this.createBalanceReportBuffer(balances);

			res.setHeader('Content-Disposition', `attachment;filename=${balancesReportFileName}`);
			res.setHeader('Content-type', 'application/csv');
			res.status(HttpStatus.CREATED);

			return res.send(balancesReportBuffer);
		} catch (err) {
			throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
		}
	}

	private async getSummaryBalances(
		query?: QueryReportBalanceDTO,
	): Promise<any> {
		const qb = new QueryBuilder(Branch, 'b', {});
		const {
			userBranchIds,
			userRoleName,
			isSuperUser,
		} = await AuthService.getUserBranchAndRole();

		if (!userBranchIds?.length) {
			throw new UnprocessableEntityException(
				`Current User request not assigned to a branch!`,
			);
		}

		// TODO: Should be validate when release in production!
		// if (userRoleName !== MASTER_ROLES.ADMIN_BRANCH) {
		//   throw new UnprocessableEntityException(
		//     `Only ADMIN BRANCH can access Summary Balances`,
		//   );
		// }

		const cacheKey = `branch_balance_${userBranchIds[0]}`;
		if (parseBool(query?.noCache)) {
			await getConnection().queryResultCache?.remove([cacheKey])
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
					b2.start_date, 
					b2.end_date,
					b2.state,
					((b2.end_date - b2.start_date) + 1) AS total_day,
					b2.total_amount,
					((b2.total_amount / ((b2.end_date - b2.start_date) + 1) * 2)) AS minimum_amount
				FROM budget b2
				WHERE b2.state = 'approved_by_spv' 
					AND b2.is_deleted IS FALSE
					AND (now() BETWEEN b2.start_date AND b2.end_date)
				ORDER BY b2.end_date DESC
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
			`(bgt.state = 'approved_by_spv')`,
		);

		if (userBranchIds?.length && !isSuperUser) {
			qb.andWhere(
				(e) => e.id,
				(v) => v.in(userBranchIds),
			);
		}

		qb.qb.cache(
			cacheKey,
			LoaderEnv.envs.CACHE_BRANCH_BALANCE_DURATION_IN_MINUTES * 60000,
		);

		return await qb.exec();
	}

	private createBalanceReportFilename(): string {
		const dateTime = dayjs(new Date()).format('YYYYMMDD-HHmmss');

		return `balances_report_${dateTime}.csv`;
	}

	private createBalanceReportBuffer(balances: Partial<ReportBalanceDTO[]>): Buffer {
		const delimiter = ";";
		const header = "branchId" + 
			delimiter + "branchName" + 
			delimiter + "bankAmount" + 
			delimiter + "cashAmount" + 
			delimiter + "totalAmount" + 
			delimiter + "minimumAmount" +
			delimiter + "retrieveAt";
		const body = balances.map(
			balance => {
				return balance.branchId +
					delimiter + balance.branchName +
					delimiter + balance.bankAmount +
					delimiter + balance.cashAmount +
					delimiter + balance.totalAmount +
					delimiter + balance.minimumAmount +
					delimiter + balance.retreiveAt;
			}
		).join("\n")

		const data = `${header}\n${body}`

		return Buffer.from(data)
	}
}
