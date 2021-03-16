import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, EntityManager, getConnection, createQueryBuilder } from 'typeorm';
import { randomStringGenerator as uuid } from '@nestjs/common/utils/random-string-generator.util';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { ExpenseItemAttribute } from '../../../model/expense-item-attribute.entity';
import { ExpenseItem } from '../../../model/expense-item.entity';
import { Expense } from '../../../model/expense.entity';
import {
  ExpenseState,
  ExpenseType,
  JournalSourceType,
  JournalState,
  MASTER_ROLES,
  PartnerState,
  PeriodState,
} from '../../../model/utils/enum';
import { CreateExpenseDTO } from '../../domain/expense/create.dto';
import { AuthService } from './auth.service';
import {
  ExpenseRelationResponse,
  ExpenseResponse,
  ExpenseWithPaginationResponse,
} from '../../domain/expense/response.dto';
import { QueryExpenseDTO } from '../../domain/expense/expense.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { NotFoundException } from '@nestjs/common';
import { AccountTax } from '../../../model/account-tax.entity';
import { Partner } from '../../../model/partner.entity';
import { Product } from '../../../model/product.entity';
import { Attachment } from '../../../model/attachment.entity';
import { ExpenseAttachmentResponse } from '../../domain/expense/response-attachment.dto';
import { AttachmentService } from '../../../common/services/attachment.service';
import { ExpenseAttachmentDTO } from '../../domain/expense/expense-attachment.dto';
import {
  ApproveExpenseDTO,
  ApproveExpenseItemDTO,
} from '../../domain/expense/approve.dto';
import { ExpenseHistory } from '../../../model/expense-history.entity';
import { Journal } from '../../../model/journal.entity';
import { JournalItem } from '../../../model/journal-item.entity';
import { User } from '../../../model/user.entity';
import { getPercentage, roundToTwo } from '../../../shared/utils';
import { AccountCoa } from '../../../model/account-coa.entity';
import { AccountCoaService } from './account-coa.service';
import { RejectExpenseDTO } from '../../domain/expense/reject.dto';
import { Period } from '../../../model/period.entity';
import { ExpenseDetailResponse } from '../../domain/expense/response-detail.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(AccountTax)
    private readonly taxRepo: Repository<AccountTax>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
  ) {}

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
    } else {
      return await AuthService.getUser();
    }
  }

  public async list(
    query?: QueryExpenseDTO,
  ): Promise<ExpenseWithPaginationResponse> {
    // TODO: Implement API List Expense
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(Expense, 'exp', params);

    qb.fieldResolverMap['startDate__gte'] = 'exp.transactionDate';
    qb.fieldResolverMap['endDate__lte'] = 'exp.transactionDate';
    qb.fieldResolverMap['branchId'] = 'exp.branchId';
    qb.fieldResolverMap['type'] = 'exp.type';
    qb.fieldResolverMap['totalAmount_gte'] = 'exp.totalAmount';
    qb.fieldResolverMap['totalAmount_lte'] = 'exp.totalAmount';
    qb.fieldResolverMap['state'] = 'exp.state';
    qb.fieldResolverMap['downPaymentNumber__contains'] =
      'exp.downPaymentNumber';
    qb.fieldResolverMap['number__contains'] = 'exp.number';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['exp.id', 'id'],
      ['exp.transaction_date', 'transactionDate'],
      ['per.month', 'periodMonth'],
      ['per.year', 'periodYear'],
      ['brc.branch_name', 'branchName'],
      ['exp.type', 'type'],
      ['exp.down_payment_id', 'downPaymentId'],
      ['adp.number', 'downPaymentNumber'],
      ['exp.number', 'number'],
      ['exp.total_amount', 'totalAmount'],
      ['exp.state', 'state'],
    );
    qb.leftJoin((e) => e.branch, 'brc');
    qb.leftJoin((e) => e.period, 'per');
    qb.leftJoin((e) => e.accountDownPayment, 'adp');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const expense = await qb.exec();
    return new ExpenseWithPaginationResponse(expense, params);
  }

  public async getById(id: string): Promise<ExpenseDetailResponse> {
    const expense = await this.expenseRepo.findOne({
      where: { id, isDeleted: false },
      relations: [
        'period',
        'branch',
        'partner',
        'items',
        'items.product',
        'items.attributes',
        'histories',
        'histories.createUser',
      ],
    });
    if (!expense) {
      throw new NotFoundException(`Expense ID ${id} not found!`);
    }
    return new ExpenseDetailResponse(expense);
  }

  /**
   * Create Expense
   *
   * @param {CreateExpenseDTO} payload
   * @return {*}  {Promise<ExpenseResponse>}
   * @memberof ExpenseService
   */
  public async create(payload: CreateExpenseDTO): Promise<ExpenseResponse> {
    if (payload && !payload.number) {
      payload.number = GenerateCode.expense();
    }

    const user = await this.getUser(true);
    const branchId = user && user.branches && user.branches[0].id;

    // Build ExpenseItem
    const items: ExpenseItem[] = [];
    for (const v of payload.items) {
      const item = new ExpenseItem();
      item.productId = v.productId;
      item.description = v.description;
      item.amount = v.amount;
      item.picHoAmount = v.amount;
      item.ssHoAmount = v.amount;
      // FIXME: Optimize this query!
      item.tax = await this.getTaxValue(payload.partnerId, v.productId);
      item.createUser = user;
      item.updateUser = user;
      item.attributes =
        v.atrributes &&
        v.atrributes.map((a) => {
          const attr = new ExpenseItemAttribute();
          attr.key = a.key;
          attr.value = a.value;
          attr.updateUser = user;
          attr.createUser = user;
          return attr;
        });
      items.push(item);
    }

    // Build Expense
    const expense = new Expense();
    expense.branchId = branchId;
    expense.number = payload.number;
    expense.sourceDocument = payload.sourceDocument;
    expense.transactionDate = payload.transactionDate;
    expense.periodId = payload.periodId;
    // TODO: Add when work in DownPayment feature
    // expense.downPaymentId = null;
    expense.downPaymentAmount = 0;
    expense.partnerId = payload.partnerId;
    expense.type = ExpenseType.EXPENSE; // TODO: Add condition when work in DownPayment feature.
    expense.paymentType = payload.paymentType;
    expense.state = ExpenseState.DRAFT;
    expense.items = items;
    expense.totalAmount =
      items &&
      items
        .map((m) => Number(m.amount))
        .filter((i) => i)
        .reduce((a, b) => a + b, 0);
    expense.histories = await this.buildHistory(expense, {
      state: ExpenseState.DRAFT,
    });
    expense.createUser = user;
    expense.updateUser = user;

    const result = await this.expenseRepo.save(expense);
    return new ExpenseResponse(result);
  }

  /**
   * Approve Expense
   *
   * @param {string} expenseId
   * @param {ApproveExpenseDTO} [payload]
   * @return {*}  {Promise<any>}
   * @memberof ExpenseService
   */
  public async approve(
    expenseId: string,
    payload?: ApproveExpenseDTO,
  ): Promise<any> {
    try {
      const approveExpense = await getManager().transaction(async (manager) => {
        const expense = await manager.findOne(Expense, {
          where: { id: expenseId, isDeleted: false },
          relations: ['attachments', 'partner', 'items', 'histories'],
        });
        if (!expense) {
          throw new NotFoundException(`Expense ID ${expenseId} not found!`);
        }

        if (expense.attachments && expense.attachments.length < 1) {
          throw new UnprocessableEntityException(
            `Expense doesn't have attachment, please add attachment first!`,
          );
        }

        if (
          expense.partner &&
          expense.partner.state !== PartnerState.APPROVED
        ) {
          throw new UnprocessableEntityException(
            `Not allowed to approve expense with partner state '${expense.partner.state}'. ` +
              `Please approve partner first!`,
          );
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name;

        // if any payload.items, we should update it first.
        // because the Journal Entries depends on items value.
        if (payload.items) {
          await this.updateExpenseItem(manager, payload.items, user);
        }

        // TODO: Implement State Machine for approval flow?
        let state: ExpenseState;
        const currentState = expense.state;
        if (userRole === MASTER_ROLES.PIC_HO) {
          // Approving with same state is not allowed
          if (
            currentState === ExpenseState.APPROVED_BY_PIC ||
            currentState === ExpenseState.APPROVED_BY_SS_SPV
          ) {
            throw new BadRequestException(
              `Can't approve expense with current state ${currentState}`,
            );
          }

          state = ExpenseState.APPROVED_BY_PIC;

          // Create Journal for PIC HO
          await this.removeJournal(manager, expense);
          const journal = await this.buildJournal(manager, expenseId, userRole);
          await this.createJournal(manager, journal);
        } else if (
          userRole === MASTER_ROLES.SS_HO ||
          userRole === MASTER_ROLES.SPV_HO
        ) {
          // Approving with same state is not allowed
          if (currentState === ExpenseState.APPROVED_BY_SS_SPV) {
            throw new BadRequestException(
              `Can't approve expense with current state ${currentState}`,
            );
          }

          state = ExpenseState.APPROVED_BY_SS_SPV;

          // (Re)Create Journal for SS/SPV HO
          await this.removeJournal(manager, expense);
          const journal = await this.buildJournal(manager, expenseId, userRole);
          await this.createJournal(manager, journal);
        }

        if (!state) {
          throw new BadRequestException(
            `Failed to approve expense due unknown user role!`,
          );
        }

        expense.state = state;
        expense.histories = await this.buildHistory(expense, { state });
        expense.updateUser = user;
        return await manager.save(expense);
      });

      return approveExpense;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject an Expense
   *
   * @param {string} expenseId
   * @param {RejectExpenseDTO} [payload]
   * @return {*}
   * @memberof ExpenseService
   */
  public async reject(
    expenseId: string,
    payload?: RejectExpenseDTO,
  ): Promise<Expense> {
    try {
      const rejectExpense = await getManager().transaction(async (manager) => {
        const expense = await manager.findOne(Expense, {
          where: { id: expenseId, isDeleted: false },
          relations: ['histories'],
        });
        if (!expense) {
          throw new NotFoundException(`Expense ID ${expenseId} not found!`);
        }

        if (expense.state === ExpenseState.REJECTED) {
          throw new UnprocessableEntityException(`Expense already rejected!`);
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name as MASTER_ROLES;

        if (!userRole) {
          throw new BadRequestException(
            `Failed to approve expense due unknown user role!`,
          );
        }

        if (
          ![
            MASTER_ROLES.PIC_HO,
            MASTER_ROLES.SS_HO,
            MASTER_ROLES.SPV_HO,
            MASTER_ROLES.SUPERUSER,
          ].includes(userRole)
        ) {
          throw new BadRequestException(
            `Only PIC/SS/SPV HO can reject expense!`,
          );
        }

        // Remove journal if state in draft, otherwise throw error
        await this.removeJournal(manager, expense);

        const { rejectedNote } = payload;
        const state = ExpenseState.REJECTED;

        expense.state = state;
        expense.histories = await this.buildHistory(expense, {
          state,
          rejectedNote,
        });
        expense.updateUser = user;
        return await manager.save(expense);
      });
      return rejectExpense;
    } catch (error) {
      throw error;
    }
  }

  /**
   * List all Attachments of Expense
   *
   * @param {string} expenseId ID of Expense
   * @return {*}  {Promise<ExpenseAttachmentResponse>}
   * @memberof ExpenseService
   */
  public async listAttachment(
    expenseId: string,
  ): Promise<ExpenseAttachmentResponse> {
    const params = { expenseId };
    const qb = new QueryBuilder(Expense, 'exp', params);

    qb.fieldResolverMap['exp.id'] = 'expenseId';
    qb.selectRaw(
      ['exp.id', 'expenseId'],
      ['att.id', 'id'],
      ['att."name"', 'name'],
      ['att.filename', 'fileName'],
      ['att.file_mime', 'fileMime'],
      ['att.url', 'url'],
    );
    qb.innerJoin(
      (e) => e.attachments,
      'att',
      (j) =>
        j.andWhere(
          (e) => e.isDeleted,
          (v) => v.isFalse(),
        ),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const attachments = await qb.exec();
    if (!attachments) {
      throw new NotFoundException(`Attachments not found!`);
    }

    return new ExpenseAttachmentResponse(attachments);
  }

  /**
   * Upload Attachment to S3 and attach to Expense
   *
   * @param {string} expenseId
   * @param {*} [files]
   * @return {*}  {Promise<ExpenseAttachmentResponse>}
   * @memberof ExpenseService
   */
  public async createAttachment(
    expenseId: string,
    files?: any,
  ): Promise<ExpenseAttachmentResponse> {
    try {
      const createAttachment = await getManager().transaction(
        async (manager) => {
          const expense = await manager.findOne(Expense, {
            where: { id: expenseId, isDeleted: false },
            relations: ['attachments'],
          });
          if (!expense) {
            throw new NotFoundException(
              `Expense with ID ${expenseId} not found!`,
            );
          }

          // Upload file attachments
          let newAttachments: Attachment[];
          if (files && files.length) {
            const expensePath = `expense/${expenseId}`;
            const attachments = await AttachmentService.uploadFiles(
              files,
              (file) => {
                const rid = uuid().split('-')[0];
                const pathId = `${expensePath}_${rid}_${file.originalname}`;
                return pathId;
              },
              manager,
            );
            newAttachments = attachments;
          }

          const existingAttachments = expense.attachments;

          expense.attachments = [].concat(existingAttachments, newAttachments);
          expense.updateUser = await this.getUser();

          await manager.save(expense);
          return newAttachments;
        },
      );

      return new ExpenseAttachmentResponse(
        createAttachment as ExpenseAttachmentDTO[],
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async deleteAttachment(expenseId: string, attachmentId: string): Promise<ExpenseResponse> {
    // TODO: Implement API Delete Expense Attachments
    const attExist = await createQueryBuilder("attachment", "att")
      .leftJoin("expense_attachment", "eat", "att.id = eat.attachment_id")
      .where("eat.expense_id = :expenseId", { expenseId: expenseId })
      .andWhere("eat.attachment_id = :attachmentId", { attachmentId: attachmentId })
      .andWhere("att.isDeleted = false")
      .getOne();

    if (!attExist) {
      throw new NotFoundException("Tidak ditemukan attachment!");

    }
    // SoftDelete
    const deleteAttachment = await this.attachmentRepo.update(attachmentId, { isDeleted: true });
    if (!deleteAttachment) {
      throw new BadRequestException('Gagal menghapus attachment!');

    }
    return new ExpenseResponse(attExist)
  }

  private async getTax(
    partnerId: string,
    productId: string,
  ): Promise<AccountTax> {
    // FIXME: Refactor to use single query if posible.
    let tax: AccountTax;

    const product = await this.productRepo.findOne(
      { id: productId },
      { select: ['id', 'isHasTax'] },
    );
    const partner = await this.partnerRepo.findOne(
      { id: partnerId },
      { select: ['id', 'type', 'npwpNumber'] },
    );
    const hasNpwp = partner && partner.npwpNumber ? true : false;

    if (product && product.isHasTax) {
      tax = await this.taxRepo.findOne({
        where: {
          partnerType: partner.type,
          isHasNpwp: hasNpwp,
        },
        select: ['id', 'taxInPercent', 'coaId'],
      });
    }

    return tax;
  }

  private async getTaxValue(
    partnerId: string,
    productId: string,
  ): Promise<number> {
    const tax = await this.getTax(partnerId, productId);

    const taxValue = tax && tax.taxInPercent;
    return taxValue;
  }

  private calculateTax(amount: number, taxValue: number) {
    const val1 = amount / (1 - getPercentage(taxValue));
    const val2 = val1 * getPercentage(taxValue);
    return val2;
  }

  /**
   * Internal Helper for create journal
   *
   * @private
   * @param {EntityManager} manager
   * @param {Journal} journal
   * @return {*}  {Promise<Journal>}
   * @memberof ExpenseService
   */
  private async createJournal(
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
        `Failed create journal due period already closed!`,
      );
    }

    return await journalRepo.save(journal);
  }

  /**
   * Internal Helper for remove exisitng journal
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} data
   * @return {*} {Promise<any>}
   * @memberof ExpenseService
   */
  private async removeJournal(
    manager: EntityManager,
    data: Expense,
  ): Promise<any> {
    const journalRepo = manager.getRepository<Journal>(Journal);
    const domain = {
      sourceType: JournalSourceType.EXPENSE,
      reference: data.number,
    };

    const journal = await journalRepo.find({ where: domain });
    const nonDraftJournal = journal.filter(
      (v) => v.state !== JournalState.DRAFT,
    );

    if (nonDraftJournal.length > 0) {
      throw new UnprocessableEntityException(
        `Can't remove journal because there are any journal entries with state not draft!`,
      );
    }

    return await journalRepo.delete(domain);
  }

  /**
   * Internal Helper for Build Journal Entity
   *
   * @private
   * @param {EntityManager} manager
   * @param {string} expenseId
   * @param {MASTER_ROLES} userRole
   * @return {*}  {Promise<Journal>}
   * @memberof ExpenseService
   */
  private async buildJournal(
    manager: EntityManager,
    expenseId: string,
    userRole: MASTER_ROLES,
  ): Promise<Journal> {
    const user = await this.getUser();
    // re-fetch data to get latest updated ExpenseItems
    const data = await manager.findOne(Expense, {
      where: { id: expenseId, isDeleted: false },
      relations: ['items', 'items.product', 'partner', 'branch'],
    });
    const j = new Journal();
    j.createUser = user;
    j.updateUser = user;
    j.branchId = data.branchId;
    j.branchCode = data?.branch?.branchCode ?? 'NO_BRANCH_CODE';
    j.transactionDate = data.transactionDate;
    j.periodId = data.periodId;
    j.number = GenerateCode.journal(data.transactionDate);
    j.reference = data.number;
    j.sourceType = JournalSourceType.EXPENSE;
    j.partnerName = data?.partner?.name ?? 'NO_PARTNER_NAME';
    j.partnerCode = data?.partner?.code ?? 'NO_PARTNER_CODE';
    j.items = await this.buildJournalItem(data, userRole);
    j.totalAmount = j.items
      .map((m) => Number(m.debit))
      .filter((i) => i)
      .reduce((a, b) => a + b, 0);
    return j;
  }

  /**
   * Internal Helper for Build Journal Item Entity
   * This is contains credit and debit item.
   *
   *  +--------------------------------------+----------+---------+
   *  | Name                                 | debit   | credit   |
   *  |--------------------------------------+----------+---------|
   *  | Product Bensin                       | 200000   | 0       |
   *  | Product Tiket                        | 800000   | 0       |
   *  | PettyCash Cabang                     | 0        | 1000000 |
   *  +--------------------------------------+----------+---------+
   *
   * @private
   * @param {Expense} data
   * @param {MASTER_ROLES} userRole
   * @return {*}  {Promise<JournalItem[]>}
   * @memberof ExpenseService
   */
  private async buildJournalItem(
    data: Expense,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    // FIXME: Remove redundant `user` and `userRole`
    // prefer to use `user` to get userRole.
    const user = await this.getUser();
    const debit = await this.buildJournalItemDebit(data, user, userRole);
    const credit = await this.buildJournalItemCredit(data, user, userRole);
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

    const items = [...new Set([...debit, ...credit])];
    return items;
  }

  /**
   * Build JournalItem Entity for Credit position.
   *
   * @private
   * @param {Expense} data
   * @param {User} user
   * @param {MASTER_ROLES} userRole
   * @return {*}  {Promise<JournalItem[]>}
   * @memberof ExpenseService
   */
  private async buildJournalItemCredit(
    data: Expense,
    user: User,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];
    const taxedItems = data?.items.filter((v) => v.tax);
    const cashCoaId = data.branch && data.branch.cashCoaId;
    let taxedAmount: number;

    const i = new JournalItem();
    i.createUser = user;
    i.updateUser = user;
    i.coaId = cashCoaId;
    i.branchId = data.branchId;
    i.transactionDate = data.transactionDate;
    i.periodId = data.periodId;
    i.reference = data.number;
    i.partnerName = data?.partner?.name ?? 'NO_PARTNER_NAME';
    i.partnerCode = data?.partner?.code ?? 'NO_PARTNER_CODE';

    // Get credit amount based on userRole
    if (userRole === MASTER_ROLES.PIC_HO) {
      i.credit = data?.items
        .map((m) => Number(m.picHoAmount))
        .filter((v) => v)
        .reduce((a, b) => a + b, 0);

      taxedAmount = taxedItems
        .map((m) => Number(m.picHoAmount))
        .filter((v) => v)
        .reduce((a, b) => a + b, 0);
    } else if (
      userRole === MASTER_ROLES.SS_HO ||
      userRole === MASTER_ROLES.SPV_HO
    ) {
      i.credit = data?.items
        .map((m) => Number(m.ssHoAmount))
        .filter((v) => v)
        .reduce((a, b) => a + b, 0);

      taxedAmount = taxedItems
        .map((m) => Number(m.ssHoAmount))
        .filter((v) => v)
        .reduce((a, b) => a + b, 0);
    }

    // Otherwise use admin branch amount
    if (!i.credit) {
      i.credit = data?.items
        .map((m) => Number(m.amount))
        .filter((v) => v)
        .reduce((a, b) => a + b, 0);

      taxedAmount = taxedItems
        .map((m) => Number(m.amount))
        .filter((v) => v)
        .reduce((a, b) => a + b, 0);
    }

    // Add JournalItem for Tax
    if (taxedItems.length > 0) {
      // FIXME: Build JournalItem for each tax?
      const taxedItem = taxedItems[0];
      const taxValue = this.calculateTax(taxedAmount, taxedItem.tax);
      if (taxValue && taxValue > 0) {
        i.credit = i.credit + roundToTwo(taxValue);
      }
    }

    items.push(i);
    return items;
  }

  /**
   * Build JournalItem Entity for Debit position.
   *
   * @private
   * @param {Expense} data
   * @param {User} user
   * @param {MASTER_ROLES} userRole
   * @return {*}  {Promise<JournalItem[]>}
   * @memberof ExpenseService
   */
  private async buildJournalItemDebit(
    data: Expense,
    user: User,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];
    const taxes: number[] = [];
    for (const v of data?.items) {
      const i = new JournalItem();
      i.createUser = user;
      i.updateUser = user;
      i.coaId = v.product && v.product.coaId;
      i.branchId = data.branchId;
      i.transactionDate = data.transactionDate;
      i.periodId = data.periodId;
      i.reference = data.number;
      i.partnerName = data?.partner?.name ?? 'NO_PARTNER_NAME';
      i.partnerCode = data?.partner?.code ?? 'NO_PARTNER_CODE';

      // Get credit amount based on userRole
      if (userRole === MASTER_ROLES.PIC_HO) {
        i.debit = v.picHoAmount;
      } else if (
        userRole === MASTER_ROLES.SS_HO ||
        userRole === MASTER_ROLES.SPV_HO
      ) {
        i.debit = v.ssHoAmount;
      }

      // Otherwise use admin branch amount
      if (!i.debit) {
        i.debit = v.amount;
      }

      if (v.tax) {
        taxes.push(this.calculateTax(i.debit, v.tax));
      }

      items.push(i);
    }

    // Add JournalItem for Tax
    if (taxes.length) {
      const taxedItems = data?.items.filter((v) => v.tax);
      const taxedItem = taxedItems[0];
      const tax = await this.getTax(data.partnerId, taxedItem.productId);
      const jTax = new JournalItem();
      jTax.createUser = user;
      jTax.updateUser = user;
      jTax.coaId = tax && tax.coaId;
      jTax.branchId = data.branchId;
      jTax.transactionDate = data.transactionDate;
      jTax.periodId = data.periodId;
      jTax.reference = data.number;
      jTax.partnerName = data?.partner?.name ?? 'NO_PARTNER_NAME';
      jTax.partnerCode = data?.partner?.code ?? 'NO_PARTNER_CODE';
      jTax.debit = roundToTwo(taxes.reduce((a, b) => a + b, 0));
      items.push(jTax);
    }

    return items;
  }

  /**
   * Internal Helper to build ExpenseHistory Entity.
   *
   * @private
   * @param {Expense} expense
   * @param {{
   *       state: ExpenseState;
   *       rejectedNote?: string;
   *     }} [data]
   * @return {*}  {Promise<ExpenseHistory[]>}
   * @memberof ExpenseService
   */
  private async buildHistory(
    expense: Expense,
    data?: {
      state: ExpenseState;
      rejectedNote?: string;
    },
  ): Promise<ExpenseHistory[]> {
    const newHistory = new ExpenseHistory();
    newHistory.state = data.state;
    newHistory.rejectedNote = data.rejectedNote;
    newHistory.createUser = await this.getUser();
    newHistory.updateUser = await this.getUser();

    const history = [].concat(expense.histories, [
      newHistory,
    ]) as ExpenseHistory[];
    return history.filter((v) => v);
  }

  /**
   * Update ExtenseItem from approval payload.
   *
   * @private
   * @param {EntityManager} manager
   * @param {ApproveExpenseItemDTO[]} datas
   * @param {User} user
   * @return {*}  {Promise<void>}
   * @memberof ExpenseService
   */
  private async updateExpenseItem(
    manager: EntityManager,
    datas: ApproveExpenseItemDTO[],
    user: User,
  ): Promise<void> {
    const expenseItemRepo = manager.getRepository<ExpenseItem>(ExpenseItem);
    for (const v of datas) {
      const item = new ExpenseItem();
      item.updateUser = user;

      if (v.checkedNote) {
        item.checkedNote = v.checkedNote;
      }
      if (v.picHoAmount) {
        item.picHoAmount = v.picHoAmount;
      }
      if (v.ssHoAmount) {
        item.ssHoAmount = v.ssHoAmount;
      }

      // Mark item is valid
      item.isValid = true;

      await expenseItemRepo.update(v.id, item);
    }
  }
}