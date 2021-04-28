import { cloneDeep } from 'lodash';
import { Repository, getManager, EntityManager, In } from 'typeorm';
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
  DownPaymentState,
  ExpenseState,
  JournalSourceType,
  JournalState,
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
import { BatchPayloadJournalDTO } from '../../domain/journal/approve.dto';
import { QueryJournalDTO } from '../../domain/journal/journal.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { JournalBatchResponse } from '../../domain/journal/response-batch.dto';
import { DownPayment } from '../../../model/down-payment.entity';
import { DownPaymentHistory } from '../../../model/down-payment-history.entity';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal)
    private readonly journalRepo: Repository<Journal>,
  ) {}

  public async list(
    query: QueryJournalDTO,
  ): Promise<JournalWithPaginationResponse> {
    const {
      userBranchIds,
      userRoleName,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();
    const SS_SPV_ROLES = [MASTER_ROLES.SS_HO, MASTER_ROLES.SPV_HO];

    const params = { order: '-transactionDate', ...query };
    const qb = new QueryBuilder(Journal, 'j', params);

    qb.fieldResolverMap['startDate__gte'] = 'j.transaction_date';
    qb.fieldResolverMap['endDate__lte'] = 'j.transaction_date';
    qb.fieldResolverMap['state'] = 'j.state';
    qb.fieldResolverMap['partner__icontains'] = 'j.partner_name';
    qb.fieldResolverMap['number__icontains'] = 'j.number';
    qb.fieldResolverMap['reference__icontains'] = 'j.reference';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['j.id', 'id'],
      ['j."number"', 'number'],
      ['j.partner_code', 'partnerCode'],
      ['j.partner_name', 'partnerName'],
      ['j.reference', 'reference'],
      ['j.state', 'state'],
      ['j.total_amount', 'totalAmount'],
      ['j.transaction_date', 'transactionDate'],
      ['j.created_at', 'createdAt'],
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
    qb.qb.groupBy('j.id');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    if (!isSuperUser) {
      // filter by assigned branch if userRoleName SS/SPV HO.
      if (SS_SPV_ROLES.includes(userRoleName)) {
        if (userBranchIds?.length) {
          qb.andWhere(
            (e) => e.branchId,
            (v) => v.in(userBranchIds),
          );
        }
      }

      // if userRoleName is Tax, only show journal that contains tax
      if (userRoleName === MASTER_ROLES.TAX) {
        const journalTaxSql = `SELECT tji.journal_id
        FROM journal_item tji
        INNER JOIN account_coa tac ON tac.id = tji.coa_id
        WHERE tac.id IN (SELECT coa_id FROM account_tax WHERE is_deleted = FALSE AND coa_id IS NOT NULL GROUP BY coa_id)
        GROUP BY tji.journal_id`;

        qb.qb.andWhere(`(j.id IN (${journalTaxSql}))`);
      }
    }

    const journals = await qb.exec();

    return new JournalWithPaginationResponse(journals, params);
  }

  /**
   * Approve journal in Batch
   *
   * @param {BatchPayloadJournalDTO} payload Array of Journal ID
   * @return {*}  {Promise<JournalBatchResponse>}
   * @memberof JournalService
   */
  public async batchApprove(
    payload: BatchPayloadJournalDTO,
  ): Promise<JournalBatchResponse> {
    const journalIds = payload?.datas?.map((data) => data.id);
    const result = await this.approveJournal(journalIds);
    return new JournalBatchResponse(result);
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
          await this.reverseExpense(manager, journal);
        } else if (sourceType === JournalSourceType.DP) {
          await this.reverseDownPayment(manager, journal);
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

    const rJournal = journal;
    rJournal.reference = `Reversal of: ${journal.number}`;
    rJournal.number = GenerateCode.journal(journal.transactionDate);
    rJournal.items = await this.buildReversalJournalItem(rJournal);
    rJournal.createUser = journal.updateUser;
    rJournal.createdAt = new Date();
    rJournal.updatedAt = new Date();
    delete rJournal.id;
    delete rJournal.isSynced;

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

  private async reverseExpense(
    manager: EntityManager,
    journal: Journal,
  ): Promise<Expense> {
    const expense = await manager.findOne(Expense, {
      where: {
        number: journal.reference,
        isDeleted: false,
      },
    });

    if (!expense) {
      // FIXME: throw error?
      return;
    }

    // Set Expense State as `reversed`
    expense.state = ExpenseState.REVERSED;
    expense.updateUser = journal.updateUser;

    return await manager.save(expense);
  }

  private async reverseDownPayment(
    manager: EntityManager,
    journal: Journal,
  ): Promise<DownPayment> {
    const downPayment = await manager.findOne(DownPayment, {
      where: { number: journal.reference, isDeleted: false },
    });

    if (!downPayment) {
      // FIXME: throw error?
      return;
    }

    downPayment.state = DownPaymentState.REVERSED;
    downPayment.updateUser = journal.updateUser;

    // create history
    const history = new DownPaymentHistory();
    history.downPaymentId = downPayment.id;
    history.state = DownPaymentState.REVERSED;
    history.rejectedNote = `Journal reversed by ${journal?.updateUser?.firstName} ${journal?.updateUser?.lastName}`;
    history.createUser = journal.updateUser;
    history.updateUser = journal.updateUser;
    await manager.save(history);

    return await manager.save(downPayment);
  }

  /**
   * Internal helper to approve journal in batch.
   *
   * @private
   * @param {string[]} ids Array of Journal ID
   * @return {*}  {Promise<{ success: object[], fail: object[] }>}
   * @memberof JournalService
   */
  private async approveJournal(
    ids: string[],
  ): Promise<{ success: object[]; fail: object[] }> {
    const { APPROVED_BY_SS_SPV_HO, APPROVED_BY_TAX, POSTED } = JournalState;
    const user = await AuthService.getUser({ relations: ['role'] });
    const userRole = user?.role?.name as MASTER_ROLES;
    const SS_SPV_ROLES = [MASTER_ROLES.SS_HO, MASTER_ROLES.SPV_HO];

    let state: JournalState;
    if (SS_SPV_ROLES.includes(userRole)) {
      state = APPROVED_BY_SS_SPV_HO;
    } else if (userRole === MASTER_ROLES.TAX) {
      state = APPROVED_BY_TAX;
    }

    const journalToUpdateIds: string[] = [];
    const failedIds: object[] = [];
    const journals = await this.journalRepo.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    for (const journal of journals) {
      if ([state, POSTED].includes(journal.state)) {
        failedIds.push({ id: journal.id });
        continue;
      }
      // journal appproved by tax can't be approve (again) by ss/spv ho.
      if (SS_SPV_ROLES.includes(userRole)) {
        if (journal.state === APPROVED_BY_TAX) {
          failedIds.push({ id: journal.id });
          continue;
        }
      }
      journalToUpdateIds.push(journal.id);
    }

    if (!state) {
      throw new UnprocessableEntityException(
        `Failed to approve journals due unknown state!`,
      );
    }

    await this.journalRepo.update(
      { id: In(journalToUpdateIds) },
      { state, updateUser: user },
    );

    const successIds = journalToUpdateIds?.map((id) => {
      return { id };
    });
    const result = { success: successIds, fail: failedIds };
    return result;
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
    });

    for (const journal of journals) {
      if (journal.state === JournalState.POSTED) {
        failedIds.push({ id: journal.id });
        continue;
      }
      journalToUpdateIds.push(journal.id);
    }

    await this.journalRepo.update(
      { id: In(journalToUpdateIds) },
      {
        state: JournalState.POSTED,
        updateUser: user,
      },
    );

    // TODO: publish message to kafka?

    const successIds = journalToUpdateIds?.map((id) => {
      return { id };
    });
    const result = { success: successIds, fail: failedIds };
    return result;
  }
}
