import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository, EntityManager, getManager } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../model/branch.entity';
import { QueryBalanceDTO } from '../../domain/balance/balance.query.dto';
import { BalanceWithPaginationResponse } from '../../domain/balance/response.dto';
import { AuthService } from './auth.service';
import { parseBool } from '../../../shared/utils/parser';
import { QuerySummaryBalanceDTO } from '../../domain/balance/summary-balance.query.dto';
import { LoaderEnv } from '../../../config/loader';
import { BalanceSummaryResponse } from '../../domain/balance/summary-response.dto';
import { GlobalSetting } from '../../../model/global-setting.entity';
import { BalanceType } from '../../../model/utils/enum';
import { Balance } from '../../../model/balance.entity';
import { CreateBalanceDTO } from '../../domain/balance/create.dto';
import { TransferBalanceDTO } from '../../domain/balance/transfer.dto';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(GlobalSetting)
    private readonly settingRepo?: Repository<GlobalSetting>,
  ) {}

  public async list(
    query: QueryBalanceDTO,
  ): Promise<BalanceWithPaginationResponse> {
    const params = { limit: 10, ...query };
    // const balances = await this.getBalances(params);
    // NOTE: special condition for MVP 1
    const balances = await this.getBalanceWithoutBudget(params);
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
    const deviationAmount = await this.getDeviationAmount();
    const balances = await this.getSummaryBalances(params);

    return new BalanceSummaryResponse(balances, deviationAmount);
  }

  private async getBalances(query?: QueryBalanceDTO): Promise<any> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Branch, 'b', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

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
        (COALESCE(SUM(credit), 0) - COALESCE(SUM(debit), 0)) AS balance
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
          (((((b2.total_amount / ((b2.end_date - b2.start_date) + 1) * 2)) / 2) * 7) + COALESCE(br.total, 0)) AS total_budget
        FROM budget b2
        LEFT JOIN (
          SELECT
            br2.budget_id,
            sum(br2.total_amount) AS total
          FROM budget_request br2
          WHERE br2.is_deleted IS FALSE
            AND br2.state = 'approved_by_pic_ho'
          GROUP BY br2.budget_id
        ) br ON br.budget_id = b2.id
        WHERE b2.state = 'approved_by_spv'
          AND b2.is_deleted IS FALSE
          AND (now()::date BETWEEN b2.start_date AND b2.end_date)
        ORDER BY b2.end_date DESC
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
    qb.qb.andWhere(`(bgt.state = 'approved_by_spv')`);

    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.id,
        (v) => v.in(userBranchIds),
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

  /**
   * Get Balances without Budget
   * NOTE: this is special condition for MVP 1
   *
   * @private
   * @param {QueryBalanceDTO} [query]
   * @return {*}  {Promise<any>}
   * @memberof BalanceService
   */
  private async getBalanceWithoutBudget(query?: QueryBalanceDTO): Promise<any> {
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Branch, 'b', params);
    qb.fieldResolverMap['branchId'] = 'b.id';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['b.id', 'branch_id'],
      ['b.branch_name', 'branch_name'],
      [
        `(COALESCE(bal.bank_amount, 0) + COALESCE(bal.cash_amount, 0) + COALESCE(bal.bon_amount, 0))`,
        'current_balance',
      ],
      ['now()', 'now'],
    );
    qb.qb.leftJoin('balance', 'bal', 'bal.branch_id = b.id');

    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.id,
        (v) => v.in(userBranchIds),
      );
    }

    const result = await qb.exec();
    return result;
  }

  private async getSummaryBalancesFromAccountStatement(
    query?: QuerySummaryBalanceDTO,
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

    // Hack branchIds for leftJoin query.
    const branchIds = userBranchIds.toString().split(',');

    // TODO: Should be validate when release in production!
    // if (userRoleName !== MASTER_ROLES.ADMIN_BRANCH) {
    //   throw new UnprocessableEntityException(
    //     `Only ADMIN BRANCH can access Summary Balances`,
    //   );
    // }

    const cacheKey = `branch_balance_${userBranchIds[0]}`;
    if (parseBool(query?.noCache)) {
      await getConnection().queryResultCache?.remove([cacheKey]);
    }

    qb.selectRaw(
      ['b.id', 'branchId'],
      ['b.branch_name', 'branchName'],
      ['COALESCE(acc_bank.balance, 0)', 'bankAmount'],
      ['COALESCE(acc_cash.balance, 0)', 'cashAmount'],
      ['COALESCE(acc_bon.balance, 0)', 'bonAmount'],
      [
        `(COALESCE(acc_bank.balance, 0) + COALESCE(acc_cash.balance, 0) + COALESCE(acc_bon.balance, 0))`,
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
          WHERE as2."type" = 'bank' AND as2.is_deleted IS FALSE AND as2.branch_id = ANY(:branchIds)
          GROUP BY
            as2.branch_id,
            as2.amount_position
        )
        SELECT
          branch_id,
          (COALESCE(SUM(credit), 0) - COALESCE(SUM(debit), 0)) AS balance
        FROM
          acc_stt_bank
        GROUP BY
          branch_id
      )`,
      'acc_bank',
      'acc_bank.branch_id = b.id',
      { branchIds },
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
          WHERE as2."type" = 'cash' AND as2.is_deleted IS FALSE AND as2.branch_id = ANY(:branchIds)
          GROUP BY
            as2.branch_id,
            as2.amount_position
        )
        SELECT
          branch_id,
          (COALESCE(SUM(credit), 0) - COALESCE(SUM(debit), 0)) AS balance
        FROM
        acc_stt_cash
        GROUP BY
          branch_id
      )`,
      'acc_cash',
      'acc_cash.branch_id = b.id',
      { branchIds },
    );
    qb.qb.leftJoin(
      `(WITH acc_stt_bon AS (
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
          WHERE as2."type" = 'bon' AND as2.is_deleted IS FALSE AND as2.branch_id = ANY(:branchIds)
          GROUP BY
            as2.branch_id,
            as2.amount_position
        )
        SELECT
          branch_id,
          (COALESCE(SUM(credit), 0) - COALESCE(SUM(debit), 0)) AS balance
        FROM
        acc_stt_bon
        GROUP BY
          branch_id
      )`,
      'acc_bon',
      'acc_bon.branch_id = b.id',
      { branchIds },
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
        WHERE b2.state = 'approved_by_spv'
          AND b2.is_deleted IS FALSE
          AND (now()::date BETWEEN b2.start_date AND b2.end_date)
          AND b2.branch_id = ANY(:branchIds)
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
      { branchIds },
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

    const result = await qb.exec();
    return result;
  }

  private async getSummaryBalances(
    query?: QuerySummaryBalanceDTO,
  ): Promise<any> {
    const qb = new QueryBuilder(Branch, 'b', {});
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    if (!userBranchIds?.length) {
      throw new UnprocessableEntityException(
        `Current User request not assigned to a branch!`,
      );
    }

    // Hack branchIds for leftJoin query.
    const branchIds = userBranchIds.toString().split(',');

    // TODO: Should be validate when release in production!
    // if (userRoleName !== MASTER_ROLES.ADMIN_BRANCH) {
    //   throw new UnprocessableEntityException(
    //     `Only ADMIN BRANCH can access Summary Balances`,
    //   );
    // }

    qb.selectRaw(
      ['b.id', 'branchId'],
      ['b.branch_name', 'branchName'],
      ['COALESCE(bal.bank_amount, 0)', 'bankAmount'],
      ['COALESCE(bal.cash_amount, 0)', 'cashAmount'],
      ['COALESCE(bal.bon_amount, 0)', 'bonAmount'],
      [
        `(COALESCE(bal.bank_amount, 0) + COALESCE(bal.cash_amount, 0) + COALESCE(bal.bon_amount, 0))`,
        'totalAmount',
      ],
      ['COALESCE(bgt.minimum_amount, 0)', 'minimumAmount'],
      ['now()', 'retreiveAt'],
    );
    qb.qb.leftJoin('balance', 'bal', 'bal.branch_id = b.id');
    qb.qb.leftJoin(
      `(WITH x_budget_summary AS (
        SELECT
          b2.branch_id,
          b2.start_date, b2.end_date,
          b2.state,
          ((b2.end_date - b2.start_date) + 1) AS total_day, b2.total_amount,
          ((b2.total_amount / ((b2.end_date - b2.start_date) + 1) * 2)) AS minimum_amount
        FROM budget b2
        WHERE b2.state = 'approved_by_spv'
          AND b2.is_deleted IS FALSE
          AND (now()::date BETWEEN b2.start_date AND b2.end_date)
          AND b2.branch_id = ANY(:branchIds)
        ORDER BY b2.end_date DESC
      )
      SELECT
        branch_id,
        total_day,
        minimum_amount,
        start_date,
        end_date,
        state
      FROM x_budget_summary)`,
      'bgt',
      'bgt.branch_id = b.id',
      { branchIds },
    );

    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.id,
        (v) => v.in(userBranchIds),
      );
    }

    const result = await qb.exec();
    return result;
  }

  private async getDeviationAmount(): Promise<number> {
    const setting = await this.settingRepo.findOne({
      select: ['deviationAmount'],
    });
    return setting?.deviationAmount;
  }

  /**
   * Invalidate Balance Cache
   *
   * @param {string} branchId
   * @return {*}  {Promise<void>}
   * @memberof BalanceService
   */
  public static async invalidateCache(branchId: string): Promise<void> {
    const cacheKey = `branch_balance_${branchId}`;
    await getConnection().queryResultCache?.remove([cacheKey]);
  }

  /**
   * Transfer Balance
   *
   * @static
   * @param {TransferBalanceDTO} data
   * @return {*}  {Promise<void>}
   * @memberof BalanceService
   */
  public static async transfer(data: TransferBalanceDTO): Promise<void> {
    const { from, to, amount, branchId, manager: mngr } = data;
    const manager = mngr ? mngr : getManager();

    if (from === to) {
      throw new BadRequestException(
        `Source and Destination Balance should difference!`,
      );
    }

    // Transfer amount should do in db transaction mode
    // we asume if there is `manager` it's mean has transaction
    // otherwise, should initialize db transaction.
    // TODO: add Row Locking when updating data for data consistency.
    const balance = new BalanceService();
    if (manager) {
      await balance.doTransfer(from, to, amount, branchId, manager);
    } else {
      await getManager().transaction(async (newManager) => {
        await balance.doTransfer(from, to, amount, branchId, newManager);
      });
    }
  }

  /**
   * Internal Helper to do transfer.
   * Please use `BalanceService.transfer()` if calling from other service.
   *
   * @static
   * @param {BalanceType} from Source Balance to decrease
   * @param {BalanceType} to Destination Balance to increase
   * @param {number} amount Total Amount to update
   * @param {string} branchId Branch ID to update
   * @param {EntityManager} manager TypeORM EntityManager
   * @return {*}  {Promise<any>}
   * @memberof BalanceService
   */
  private async doTransfer(
    from: BalanceType,
    to: BalanceType,
    amount: number,
    branchId: string,
    manager: EntityManager,
  ): Promise<any> {
    if (from === to) {
      throw new BadRequestException(
        `Source and Destination Balance should difference!`,
      );
    }

    const balanceRepo = manager.getRepository(Balance);
    const balance = await balanceRepo.findOne({ where: { branchId } });

    if (!balance) {
      balance.branchId = branchId;
      balance.bankAmount = 0;
      balance.cashAmount = 0;
      balance.bonAmount = 0;
    }

    // Add Amount
    switch (to) {
      case BalanceType.BANK:
        balance.bankAmount = +balance.bankAmount + +amount;
        break;
      case BalanceType.CASH:
        balance.cashAmount = +balance.cashAmount + +amount;
        break;
      case BalanceType.BON:
        balance.bonAmount = +balance.bonAmount + +amount;
        break;
    }

    // Reduce Amount
    switch (from) {
      case BalanceType.BANK:
        balance.bankAmount = +balance.bankAmount - +amount;
        break;
      case BalanceType.CASH:
        balance.cashAmount = +balance.cashAmount - +amount;
        break;
      case BalanceType.BON:
        balance.bonAmount = +balance.bonAmount - +amount;
        break;
    }

    return await balanceRepo.save(balance);
  }

  /**
   * Increase Balance Amount
   *
   * @static
   * @param {CreateBalanceDTO} data
   * @return {*}  {Promise<Balance>}
   * @memberof BalanceService
   */
  public static async increase(data: CreateBalanceDTO): Promise<Balance> {
    const { type, amount, branchId, manager: mngr } = data;
    const manager = mngr ? mngr : getManager();
    const balanceRepo = manager.getRepository(Balance);
    let balance = await balanceRepo.findOne({ where: { branchId } });

    if (!balance) {
      balance = new Balance();
      balance.branchId = branchId;
      balance.bankAmount = 0;
      balance.cashAmount = 0;
      balance.bonAmount = 0;
    }

    switch (type) {
      case BalanceType.BANK:
        balance.bankAmount = +balance.bankAmount + +amount;
        break;
      case BalanceType.CASH:
        balance.cashAmount = +balance.cashAmount + +amount;
        break;
      case BalanceType.BON:
        balance.bonAmount = +balance.bonAmount + +amount;
        break;
    }

    return await balanceRepo.save(balance);
  }

  /**
   * Decrease Balance Amount
   *
   * @static
   * @param {CreateBalanceDTO} data
   * @return {*}  {Promise<Balance>}
   * @memberof BalanceService
   */
  public static async decrease(data: CreateBalanceDTO): Promise<Balance> {
    const { type, amount, branchId, manager: mngr } = data;
    const manager = mngr ? mngr : getManager();
    const balanceRepo = manager.getRepository(Balance);
    let balance = await balanceRepo.findOne({ where: { branchId } });

    if (!balance) {
      balance = new Balance();
      balance.branchId = branchId;
      balance.bankAmount = 0;
      balance.cashAmount = 0;
      balance.bonAmount = 0;
    }

    switch (type) {
      case BalanceType.BANK:
        balance.bankAmount = +balance.bankAmount - +amount;
        break;
      case BalanceType.CASH:
        balance.cashAmount = +balance.cashAmount - +amount;
        break;
      case BalanceType.BON:
        balance.bonAmount = +balance.bonAmount - +amount;
        break;
    }

    return await balanceRepo.save(balance);
  }

  /**
   * Helper to check if balance is sufficient or not
   *
   * @static
   * @param {{
   *     branchId: string;
   *     amount: number;
   *     type: BalanceType;
   *   }} data
   * @return {*}  {Promise<boolean>}
   * @memberof BalanceService
   */
  public static async isSufficient(data: {
    branchId: string;
    amount: number;
    type: BalanceType;
  }): Promise<boolean> {
    const { branchId, amount, type } = data;
    const balanceRepo = getManager().getRepository(Balance);
    const balance = await balanceRepo.findOne({ where: { branchId } });

    if (!balance) return false;

    switch (type) {
      case BalanceType.BANK:
        return amount <= balance.bankAmount;
      case BalanceType.CASH:
        return amount <= balance.cashAmount;
      case BalanceType.BON:
        return amount <= balance.bonAmount;
      default:
        return false;
    }
  }
}
