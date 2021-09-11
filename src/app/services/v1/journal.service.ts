import { cloneDeep } from 'lodash';
import {
  Repository,
  getManager,
  EntityManager,
  In,
  FindOneOptions,
} from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Journal } from '../../../model/journal.entity';
import { JournalWithPaginationResponse } from '../../domain/journal/response.dto';
import {
  AccountStatementSourceType,
  DownPaymentState,
  DownPaymentType,
  ExpenseState,
  JournalSourceType,
  JournalState,
  LoanSourceType,
  MASTER_ROLES,
  PeriodState,
} from '../../../model/utils/enum';
import { Expense } from '../../../model/expense.entity';
import { AuthService } from './auth.service';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { JournalItem } from '../../../model/journal-item.entity';
import { Period } from '../../../model/period.entity';
import { User } from '../../../model/user.entity';
import { ReverseJournalDTO } from '../../domain/journal/reverse.dto';
import { BatchPayloadJournalDTO } from '../../domain/journal/batch-payload.dto';
import { QueryJournalDTO } from '../../domain/journal/journal.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { JournalBatchResponse } from '../../domain/journal/response-batch.dto';
import { DownPayment } from '../../../model/down-payment.entity';
import { DownPaymentHistory } from '../../../model/down-payment-history.entity';
import { ExpenseHistory } from '../../../model/expense-history.entity';
import { AccountPayment } from '../../../model/account-payment.entity';
import { Loan } from '../../../model/loan.entity';
import { PinoLogger } from 'nestjs-pino';
import { AccountStatementService } from './account-statement.service';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal)
    private readonly journalRepo: Repository<Journal>,
    private readonly logger: PinoLogger,
  ) {}

  public async list(
    query: QueryJournalDTO,
  ): Promise<JournalWithPaginationResponse> {
    const { userRoleName } = await AuthService.getUserBranchAndRole();
    const NOT_ALLOWED_ROLES = [
      MASTER_ROLES.ADMIN_BRANCH,
      MASTER_ROLES.OPS,
      MASTER_ROLES.PIC_HO,
    ];

    // Throw error for some user role.
    if (NOT_ALLOWED_ROLES.includes(userRoleName)) {
      throw new UnprocessableEntityException(
        `You're not allowed to access this menu`,
      );
    }

    const params = { order: '-transactionDate', ...query };
    const qb = new QueryBuilder(Journal, 'j', params);

    qb.fieldResolverMap['startDate__gte'] = 'j.transaction_date';
    qb.fieldResolverMap['endDate__lte'] = 'j.transaction_date';
    qb.fieldResolverMap['branchId'] = 'j.branch_id';
    qb.fieldResolverMap['state'] = 'j.state';
    qb.fieldResolverMap['partner__icontains'] = 'j.partner_name';
    qb.fieldResolverMap['number__icontains'] = 'j.number';
    qb.fieldResolverMap['reference__icontains'] = 'j.reference';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['j.id', 'id'],
      ['j.reverse_journal_id', 'reverseJournalId'],
      ['j."number"', 'number'],
      ['j.partner_code', 'partnerCode'],
      ['j.partner_name', 'partnerName'],
      ['j.reference', 'reference'],
      ['j.sync_fail_reason', 'syncFailReason'],
      ['j.state', 'state'],
      ['j.total_amount', 'totalAmount'],
      ['j.transaction_date', 'transactionDate'],
      ['j.created_at', 'createdAt'],
      ['(array_agg(brc.branch))[1]', 'branch'],
      ['(array_agg(p.periods))[1]', 'period'],
      ['(array_agg(jitem.items))[1]', 'items'],
    );
    qb.qb.leftJoin(
      `(SELECT
        ji.journal_id,
        jsonb_agg(
          json_build_object(
            'id', ji.id,
            'journal_id', ji.journal_id,
            'coaId', ac2.id,
            'coa', json_build_object(
              'name', ac2.name,
              'code', ac2.code
            ),
            'debit', ji.debit ,
            'credit', ji.credit,
            'partnerCode', ji.partner_code,
            'partnerName', ji.partner_name,
            'reference', ji.reference,
            'description', ji.description,
            'isLedger', ji.is_ledger,
            'transactionDate', ji.transaction_date
            )
        ) AS items
      FROM journal_item ji
      LEFT JOIN account_coa ac2 ON ac2.id = ji.coa_id
      GROUP BY ji.journal_id)`,
      'jitem',
      'jitem.journal_id = j.id',
    );
    qb.qb.leftJoin(
      `(SELECT
        p2.id,
        json_build_object(
          'id', p2.id,
          'month', p2.month,
          'year', p2.year
        ) AS periods
      FROM "period" p2
      GROUP BY p2.id)`,
      'p',
      'p.id = j.period_id',
    );
    qb.qb.leftJoin(
      `(SELECT
        b.id,
        json_build_object(
          'id', b.id,
          'branchName', b.branch_name
        ) AS branch
      FROM branch b
      GROUP BY b.id)`,
      'brc',
      'brc.id = j.branch_id',
    );
    qb.qb.groupBy('j.id');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.qb.addOrderBy('j.updated_at', 'DESC');

    // Throw error for some user role.
    if (NOT_ALLOWED_ROLES.includes(userRoleName)) {
      throw new UnprocessableEntityException();
    }

    const journals = await qb.exec();

    return new JournalWithPaginationResponse(journals, params);
  }

  /**
   * Post journal in Batch
   *
   * @param {BatchPayloadJournalDTO} payload Array of Journal ID
   * @return {*}  {Promise<JournalBatchResponse>}
   * @memberof JournalService
   */
  public async batchPost(
    payload: BatchPayloadJournalDTO,
  ): Promise<JournalBatchResponse> {
    const journalIds = payload?.datas?.map((data) => data.id);
    const result = await this.postJournal(journalIds);
    return new JournalBatchResponse(result);
  }

  /**
   * Reverse journal in Batch
   *
   * @param {BatchPayloadJournalDTO} payload Array if Journal ID
   * @return {*}  {Promise<JournalBatchResponse>}
   * @memberof JournalService
   */
  public async batchReverse(
    payload: BatchPayloadJournalDTO,
  ): Promise<JournalBatchResponse> {
    const journalIds = payload?.datas?.map((data) => data.id);
    const successIds = [];
    const failedIds = [];

    for (const journalId of journalIds) {
      try {
        const reverse = await this.reverseJournal(journalId);
        if (reverse) {
          successIds.push({ id: journalId });
        } else {
          failedIds.push({ id: journalId });
        }
      } catch (error) {
        this.logger.error(error);
        failedIds.push({ id: journalId });
        continue;
      }
    }

    const result = { success: successIds, fail: failedIds };
    return new JournalBatchResponse(result);
  }

  /**
   * Internal helper to reverse journal
   *
   * @private
   * @param {string} id Journal ID
   * @param {ReverseJournalDTO} [payload]
   * @return {*}  {Promise<Journal>}
   * @memberof JournalService
   */
  private async reverseJournal(
    id: string,
    payload?: ReverseJournalDTO,
  ): Promise<Journal> {
    try {
      const reverseJournal = await getManager().transaction(async (manager) => {
        const user = await AuthService.getUser({ relations: ['role'] });

        await this.checkPermissionReversal(user);

        const journalRepo = manager.getRepository<Journal>(Journal);
        const journal = await journalRepo.findOne({
          where: { id, isDeleted: false },
          relations: ['items'],
        });

        if (!journal) {
          throw new NotFoundException(`Journal with ID ${id} not found!`);
        }

        if (journal.reverseJournalId) {
          throw new BadRequestException(
            `Journal with ID ${id} already reversed!`,
          );
        }

        const sourceType = journal.sourceType;
        journal.updateUser = user;

        // Update Related Journal Source
        // e.g: Expense, DownPayment, etc
        if (sourceType === JournalSourceType.EXPENSE) {
          await this.reverseExpenseFromJournal(manager, journal);
        } else if (sourceType === JournalSourceType.DP) {
          await this.reverseDownPaymentFromJournal(manager, journal);
        } else if (sourceType === JournalSourceType.PAYMENT) {
          await this.removePaymentFromJournal(manager, journal);
        }

        // Clone Journal for Creating new Reversal Journal
        const cJournal = cloneDeep(journal);
        cJournal.transactionDate = payload?.reverseDate ?? new Date();

        const rJournal = await this.createReversalJournal(manager, cJournal);
        journal.reverseJournal = rJournal;

        return await manager.save(journal);
      });

      return reverseJournal;
    } catch (error) {
      throw error;
    }
  }

  private async checkPermissionReversal(user: User): Promise<void> {
    const allowedRoles = [MASTER_ROLES.SUPERUSER, MASTER_ROLES.ACCOUNTING];
    const userRole = user?.role?.name as MASTER_ROLES;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException(
        `User with role ${userRole} not allowed to do this action!`,
      );
    }

    return;
  }

  private async createReversalJournal(
    manager: EntityManager,
    journal: Journal,
  ): Promise<Journal> {
    const journalRepo = manager.getRepository<Journal>(Journal);
    const periodRepo = manager.getRepository<Period>(Period);

    const period = await periodRepo.findOne({
      where: { id: journal.periodId, isDeleted: false },
    });
    if (!period || (period && period.state === PeriodState.CLOSE)) {
      throw new BadRequestException(
        `Reversing journal on closed period is not allowed!`,
      );
    }

    const now = new Date();
    const user = await AuthService.getUser();

    const rJournal = journal;
    rJournal.createUser = user;
    rJournal.updateUser = user;
    rJournal.createdAt = now;
    rJournal.updatedAt = now;
    rJournal.transactionDate = now;
    rJournal.reference = `Reversal of: ${journal.number}`;
    rJournal.number = GenerateCode.journal(journal.transactionDate);
    rJournal.items = await this.buildReversalJournalItem(rJournal);
    delete rJournal.id;
    delete rJournal.isSynced;
    delete rJournal.syncFailReason;

    return await journalRepo.save(rJournal);
  }

  private async buildReversalJournalItem(
    journal: Journal,
  ): Promise<JournalItem[]> {
    const jItems = cloneDeep(journal.items);
    const debits = jItems.filter((i) => i.debit !== 0);
    const credits = jItems.filter((i) => i.credit !== 0);

    const debit = debits.map((item) => {
      const temp = Object.assign({}, item);
      if (temp.debit !== 0) {
        temp.credit = temp.debit;
        temp.debit = 0;
      }
      return temp;
    });
    const credit = credits.map((item) => {
      const temp = Object.assign({}, item);
      if (temp.credit !== 0) {
        temp.debit = temp.credit;
        temp.credit = 0;
      }
      return temp;
    });

    const amountDebit = debit
      .map((m) => Number(m.debit))
      .filter((i) => i)
      .reduce((a, b) => a + b, 0);
    const amountCredit = credit
      .map((m) => Number(m.credit))
      .filter((i) => i)
      .reduce((a, b) => a + b, 0);

    if (amountDebit !== amountCredit) {
      throw new Error(`Amount debit and credit should equal!`);
    }

    const newItems = [...new Set([...debit, ...credit])];
    const items = newItems.map((item) => {
      const temp = Object.assign({}, item);
      temp.reference = journal.number;
      temp.transactionDate = journal.transactionDate;
      temp.createUser = journal.updateUser;
      temp.updateUser = journal.updateUser;
      delete temp.id;
      delete temp.journalId;
      return temp;
    });

    return items;
  }

  private async reverseExpenseFromJournal(
    manager: EntityManager,
    journal: Journal,
  ): Promise<Expense> {
    const expense = await manager.findOne(Expense, {
      where: {
        number: journal.reference,
        isDeleted: false,
      },
    });

    // FIXME: throw error?
    if (!expense) return;

    // Remove Expense Loan
    await this.reverseExpenseLoan(manager, expense);

    // Reverse DownPayment
    const dp = await this.getDownPaymentById(manager, expense?.downPaymentId);
    if (dp) {
      await this.reverseDownPaymentJournal(manager, dp);
      await this.reverseDownPayment(manager, dp);
    }

    return await this.reverseExpense(manager, expense);
  }

  private async reverseExpense(
    manager: EntityManager,
    expense: Expense,
  ): Promise<Expense> {
    const user = await AuthService.getUser();
    // Set Expense State as `reversed`
    expense.state = ExpenseState.REVERSED;
    expense.updateUser = user;

    // add history
    const history = new ExpenseHistory();
    history.expenseId = expense.id;
    history.state = expense.state;
    history.createUser = expense.updateUser;
    history.updateUser = expense.updateUser;
    history.rejectedNote = `Journal reversed by ${user?.firstName} ${user?.lastName}`;
    await manager.save(history);

    return await manager.save(expense);
  }

  private async reverseExpenseJournal(
    manager: EntityManager,
    expense: Expense,
  ): Promise<Journal> {
    const user = await AuthService.getUser();
    const journal = await manager.getRepository(Journal).findOne({
      where: {
        reference: expense?.number,
        sourceType: JournalSourceType.EXPENSE,
        branchId: expense?.branchId,
      },
      relations: ['items'],
    });

    if (!journal) return;

    const cJournal = cloneDeep(journal);
    const rJournal = await this.createReversalJournal(manager, cJournal);
    journal.reverseJournal = rJournal;
    journal.updateUser = user;

    return await manager.save(journal);
  }

  private async reverseExpenseLoan(
    manager: EntityManager,
    expense: Expense,
  ): Promise<void> {
    const loanFindOptions: FindOneOptions<Loan> = {
      where: {
        sourceDocument: expense?.number,
        sourceType: LoanSourceType.EXPENSE,
        branchId: expense?.branchId,
      },
    };
    await this.removeLoan(manager, loanFindOptions);
  }

  private async reverseDownPaymentFromJournal(
    manager: EntityManager,
    journal: Journal,
  ): Promise<any> {
    const dp = await manager.findOne(DownPayment, {
      where: { number: journal.reference, isDeleted: false },
    });

    // FIXME: throw error?
    if (!dp) return;

    // Reverse or Remove Relation
    if (dp?.type === DownPaymentType.REIMBURSEMENT) {
      await this.reverseDownPaymentLoan(manager, dp);
      dp.loanId = null;
    } else if (dp?.type === DownPaymentType.PERDIN) {
      const expense = await manager.getRepository(Expense).findOne({
        where: { id: dp?.expenseId },
      });
      if (expense) {
        await this.reverseExpenseLoan(manager, expense);
        await this.reverseExpenseJournal(manager, expense);
        await this.reverseExpense(manager, expense);
      }
    }

    // Reverse DownPayment
    await this.reverseDownPayment(manager, dp);
  }

  private async reverseDownPayment(
    manager: EntityManager,
    downPayment: DownPayment,
  ): Promise<DownPayment> {
    const user = await AuthService.getUser();

    downPayment.state = DownPaymentState.REVERSED;
    downPayment.updateUser = user;

    // create history
    const history = new DownPaymentHistory();
    history.downPaymentId = downPayment.id;
    history.state = DownPaymentState.REVERSED;
    history.rejectedNote = `Journal reversed by ${user?.firstName} ${user?.lastName}`;
    history.createUser = user;
    history.updateUser = user;
    await manager.save(history);

    // Delete existing statement if any
    await AccountStatementService.deleteAndUpdateBalance(
      {
        where: {
          sourceType: AccountStatementSourceType.DP,
          reference: downPayment?.number,
          branchId: downPayment?.branchId,
          isDeleted: false,
        },
      },
      manager,
    );

    return await manager.save(downPayment);
  }

  private async reverseDownPaymentJournal(
    manager: EntityManager,
    dp: DownPayment,
  ): Promise<Journal> {
    const user = await AuthService.getUser();
    const journal = await manager.getRepository(Journal).findOne({
      where: {
        reference: dp?.number,
        sourceType: JournalSourceType.DP,
        branchId: dp?.branchId,
      },
      relations: ['items'],
    });

    if (!journal) return;

    const cJournal = cloneDeep(journal);
    const rJournal = await this.createReversalJournal(manager, cJournal);
    journal.reverseJournal = rJournal;
    journal.updateUser = user;

    return await manager.save(journal);
  }

  private async reverseDownPaymentLoan(
    manager: EntityManager,
    dp: DownPayment,
  ): Promise<void> {
    const loanFindOptions: FindOneOptions<Loan> = {
      where: {
        sourceDocument: dp?.number,
        sourceType: LoanSourceType.DP,
        branchId: dp?.branchId,
      },
    };
    await this.removeLoan(manager, loanFindOptions);
  }

  private async getDownPaymentById(
    manager: EntityManager,
    id: string,
  ): Promise<DownPayment> {
    const dp = await manager.findOne(DownPayment, {
      where: { id },
    });
    return dp;
  }

  private async removeLoan(
    manager: EntityManager,
    findOpts: FindOneOptions<Loan>,
  ): Promise<void> {
    const loanRepo = manager.getRepository(Loan);
    const loan = await loanRepo.findOne({
      where: findOpts?.where,
      relations: ['payments'],
    });

    if (!loan) return;

    // If Loan has Payments, need to reverse journal payments first.
    if (loan.payments?.length > 0) {
      throw new UnprocessableEntityException(
        `Loan from this transaction has payments. ` +
          `Please reverse the payments journal's before reversing this journal!`,
      );
    } else {
      await loanRepo.delete({ id: loan.id });
    }
  }

  private async removePaymentFromJournal(
    manager: EntityManager,
    journal: Journal,
  ): Promise<void> {
    const payment = await manager.findOne(AccountPayment, {
      where: {
        number: journal?.reference,
        branchId: journal?.branchId,
        isDeleted: false,
      },
      select: ['id', 'number', 'amount'],
    });

    if (!payment) return;

    // Hard Delete AccountStatement (mutasi) from payment.
    await AccountStatementService.deleteAndUpdateBalance(
      {
        where: {
          sourceType: AccountStatementSourceType.PAYMENT,
          reference: payment?.number,
          branchId: journal?.branchId,
        },
      },
      manager,
    );

    // Update Loan
    const amount = payment?.amount || 0;
    const sqlUpdateLoan = `UPDATE loan
      SET paid_amount = paid_amount - ${amount},
        residual_amount = residual_amount + ${amount},
        state = 'unpaid',
        updated_at = now(),
        update_user_id = '${journal?.updateUser?.id}'
      WHERE id IN (
        SELECT loan_id FROM loan_payment WHERE payment_id IN (
          SELECT id FROM account_payment WHERE number = '${journal?.reference}' AND branch_id = '${journal?.branchId}'
        )
      )`;
    await manager.query(sqlUpdateLoan);

    // Hard Delete Payments.
    await manager.delete(AccountPayment, {
      number: journal?.reference,
      branchId: journal?.branchId,
      isDeleted: false,
    });
  }

  /**
   * Internal helper to post journal in batch.
   *
   * @private
   * @param {string[]} ids
   * @return {*}  {Promise<{ success: object[]; fail: object[] }>}
   * @memberof JournalService
   */
  private async postJournal(
    ids: string[],
  ): Promise<{ success: object[]; fail: object[] }> {
    const user = await AuthService.getUser({ relations: ['role'] });
    const userRole = user?.role?.name as MASTER_ROLES;
    const NOT_ALLOWED_STATE = [JournalState.POSTED];

    if (userRole !== MASTER_ROLES.ACCOUNTING) {
      throw new BadRequestException(
        `Only user with role ACCOUNTING can post journal!`,
      );
    }

    const journalToUpdateIds: string[] = [];
    const failedIds: object[] = [];
    const journals = await this.journalRepo.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
      select: ['id', 'state'],
    });

    for (const journal of journals) {
      // Journal with state `sync_failed` automatically allow to be posted.
      if (journal.state === JournalState.SYNC_FAILED) {
        journalToUpdateIds.push(journal.id);
        continue;
      }

      if (NOT_ALLOWED_STATE.includes(journal.state)) {
        failedIds.push({ id: journal.id });
        continue;
      }

      journalToUpdateIds.push(journal.id);
    }

    await this.journalRepo.update(
      { id: In(journalToUpdateIds) },
      {
        state: JournalState.POSTED,
        syncFailReason: null,
        updateUser: user,
      },
    );

    const successIds = journalToUpdateIds?.map((id) => {
      return { id };
    });
    const result = { success: successIds, fail: failedIds };
    return result;
  }
}
