import { cloneDeep } from 'lodash';
import { Repository, getManager, EntityManager } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Journal } from '../../../model/journal.entity';
import { JournalWithPaginationResponse } from '../../domain/journal/response.dto';
import {
  ExpenseState,
  JournalSourceType,
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
import { BatchApproveJournalDTO } from '../../domain/journal/approve.dto';
import { QueryJournalDTO } from '../../domain/journal/journal.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal)
    private readonly journalRepo: Repository<Journal>,
  ) {}

  public async list(
    query: QueryJournalDTO,
  ): Promise<JournalWithPaginationResponse> {
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

    const journals = await qb.exec();

    return new JournalWithPaginationResponse(journals, params);
  }

  public async approve(id: string): Promise<any> {
    // TODO: Implement API approve journal
  }

  public async batchApprove(payload: BatchApproveJournalDTO): Promise<any> {
    // TODO: Implement API approve journal
    return payload;
  }

  public async post(id: string): Promise<any> {
    // TODO: Implement API post journal
  }

  public async reverse(id: string, payload: ReverseJournalDTO): Promise<void> {
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
          // TODO: Update DownPayment
        }

        // Clone Journal for Creating new Reversal Journal
        const cJournal = cloneDeep(journal);
        cJournal.transactionDate = payload.reverseDate ?? new Date();

        const rJournal = await this.createReversalJournal(manager, cJournal);
        journal.reverseJournal = rJournal;

        return await manager.save(journal);
      });

      return;
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
    rJournal.number = GenerateCode.journal(journal.transactionDate);
    rJournal.reference = `Reversal of: ${journal.number}`;
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
}
