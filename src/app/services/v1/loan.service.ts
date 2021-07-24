import {
  Repository,
  getManager,
  EntityManager,
  createQueryBuilder,
  In,
} from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { randomStringGenerator as uuid } from '@nestjs/common/utils/random-string-generator.util';
import { Loan } from '../../../model/loan.entity';
import { LoanDTO } from '../../domain/loan/loan.dto';
import { QueryLoanDTO } from '../../domain/loan/loan.query.dto';
import { LoanWithPaginationResponse } from '../../domain/loan/response.dto';
import { LoanDetailResponse } from '../../domain/loan/response-detail.dto';
import { CreatePaymentLoanDTO } from '../../domain/loan/create-payment.dto';
import { AccountPayment } from '../../../model/account-payment.entity';
import { AuthService } from './auth.service';
import {
  AccountPaymentPayMethod,
  AccountPaymentType,
  AccountStatementAmountPosition,
  AccountStatementSourceType,
  AccountStatementType,
  DownPaymentType,
  JournalSourceType,
  LoanState,
  LoanType,
  PeriodState,
} from '../../../model/utils/enum';
import { LoanAttachmentResponse } from '../../domain/loan/response-attachment.dto';
import { Attachment } from '../../../model/attachment.entity';
import { AttachmentService } from '../../../common/services/attachment.service';
import { LoanAttachmentDTO } from '../../domain/loan/loan-attachment.dto';
import { CreateLoanDTO } from '../../domain/loan/create.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { PeriodService } from './period.service';
import { AccountStatement } from '../../../model/account-statement.entity';
import { BalanceService } from './balance.service';
import { Journal } from '../../../model/journal.entity';
import { Period } from '../../../model/period.entity';
import { Branch } from '../../../model/branch.entity';
import { JournalItem } from '../../../model/journal-item.entity';
import { DownPayment } from '../../../model/down-payment.entity';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
  ) {}

  public async create(payload: CreateLoanDTO): Promise<any> {
    const user = await AuthService.getUser({ relations: ['branches'] });
    // TODO: branchId should get from requested user.
    // payload.branchId = user?.branches[0].id;

    if (payload && !payload.number) {
      payload.number = GenerateCode.loan();
    }

    const {
      branchId,
      number,
      sourceDocument,
      transactionDate,
      periodId,
      employeeId,
      amount,
      type,
    } = payload;

    const loan = new Loan();
    loan.branchId = branchId;
    loan.number = number;
    loan.sourceDocument = sourceDocument;
    loan.transactionDate = transactionDate;
    loan.periodId = periodId;
    loan.employeeId = employeeId;
    loan.amount = amount;
    loan.residualAmount = amount;
    loan.type = type;
    loan.createUser = user;
    loan.updateUser = user;

    const result = await this.loanRepo.save(loan);
    return result;
  }

  public async list(query?: QueryLoanDTO): Promise<LoanWithPaginationResponse> {
    const params = { ...query };
    const qb = new QueryBuilder(Loan, 'l', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['startDate__gte'] = 'l.transaction_date';
    qb.fieldResolverMap['endDate__lte'] = 'l.transaction_date';
    qb.fieldResolverMap['number__icontains'] = 'l.number';
    qb.fieldResolverMap['sourceDocument__icontains'] = 'l.source_document';
    qb.fieldResolverMap['branchId'] = 'l.branch_id';
    qb.fieldResolverMap['employeeId'] = 'l.employee_id';
    qb.fieldResolverMap['state'] = 'l.state';
    qb.fieldResolverMap['type'] = 'l.type';
    qb.fieldResolverMap['createdAt'] = 'l.created_at';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['l.id', 'id'],
      ['l.number', 'number'],
      ['l.transaction_date', 'transactionDate'],
      ['l.type', 'type'],
      ['l.state', 'state'],
      ['l.amount', 'amount'],
      ['l.residual_amount', 'residualAmount'],
      ['l.paid_amount', 'paidAmount'],
      ['l.source_document', 'sourceDocument'],
      ['l.down_payment_id', 'downPaymentId'],
      ['l.created_at', 'createdAt'],
      ['p.month', 'periodMonth'],
      ['p.year', 'periodYear'],
      ['b.branch_name', 'branchName'],
      ['b.branch_code', 'branchCode'],
      ['e.name', 'employeeName'],
      ['e.nik', 'employeeNik'],
    );
    qb.leftJoin((e) => e.branch, 'b');
    qb.leftJoin((e) => e.period, 'p');
    qb.leftJoin((e) => e.employee, 'e');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranchIds),
      );
    }

    const loan: LoanDTO[] = await qb.exec();
    return new LoanWithPaginationResponse(loan, params);
  }

  public async getById(id: string): Promise<LoanDetailResponse> {
    const {
      isSuperUser,
      userBranchIds,
    } = await AuthService.getUserBranchAndRole();

    const where = { id, isDeleted: false };
    if (!isSuperUser) {
      Object.assign(where, { branchId: In(userBranchIds) });
    }

    const loan = await this.loanRepo.findOne({
      where,
      relations: ['employee', 'downPayment', 'downPayment.product', 'payments'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found!`);
    }
    return new LoanDetailResponse(loan);
  }

  /**
   * List all Attachments of Loan
   *
   * @param {string} loanId ID of Loan
   * @return {*}  {Promise<LoanAttachmentResponse>}
   * @memberof LoanService
   */
  public async listAttachment(loanId: string): Promise<LoanAttachmentResponse> {
    const qb = new QueryBuilder(Loan, 'l', {});

    qb.selectRaw(
      ['l.id', 'loanId'],
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
    qb.andWhere(
      (e) => e.id,
      (v) => v.equals(loanId),
    );

    const attachments = await qb.exec();
    if (!attachments) {
      throw new NotFoundException(`Attachments not found!`);
    }

    return new LoanAttachmentResponse(attachments);
  }

  /**
   * Upload Attachment to S3 and attach to Loan
   *
   * @param {string} loanId ID of Loan
   * @param {*} [files] Attachment files
   * @return {*}  {Promise<LoanAttachmentResponse>}
   * @memberof LoanService
   */
  public async createAttachment(
    loanId: string,
    files?: any,
    attachmentType?: any,
  ): Promise<LoanAttachmentResponse> {
    try {
      const createAttachment = await getManager().transaction(
        async (manager) => {
          const loan = await manager.findOne(Loan, {
            where: { id: loanId, isDeleted: false },
            relations: ['attachments'],
          });
          if (!loan) {
            throw new NotFoundException(`Loan with ID ${loanId} not found!`);
          }

          // Upload file attachments
          let newAttachments: Attachment[];
          if (files && files.length) {
            const loanPath = `loan/${loanId}`;
            const attachments = await AttachmentService.uploadFiles(
              files,
              (file) => {
                const rid = uuid().split('-')[0];
                const pathId = `${loanPath}_${rid}_${file.originalname}`;
                return pathId;
              },
              attachmentType,
              manager,
            );
            newAttachments = attachments;
          }

          const existingAttachments = loan.attachments;

          loan.attachments = [].concat(existingAttachments, newAttachments);
          loan.updateUser = await AuthService.getUser();

          await manager.save(loan);
          return newAttachments;
        },
      );

      return new LoanAttachmentResponse(
        createAttachment as LoanAttachmentDTO[],
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Soft Delete Attachment
   *
   * @param {string} loanId ID of Loan
   * @param {string} attachmentId Attachment ID to delete.
   * @return {*}  {Promise<void>}
   * @memberof LoanService
   */
  public async deleteAttachment(
    loanId: string,
    attachmentId: string,
  ): Promise<void> {
    const attachment = await createQueryBuilder('attachment', 'att')
      .innerJoin('loan_attachment', 'lat', 'att.id = lat.attachment_id')
      .where('lat.loan_id = :loanId', { loanId })
      .andWhere('lat.attachment_id = :attachmentId', { attachmentId })
      .andWhere('att.isDeleted = false')
      .getOne();

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with ID ${attachmentId} not found!`,
      );
    }
    // SoftDelete
    const deleteAttachment = await this.attachmentRepo.update(attachmentId, {
      isDeleted: true,
    });
    if (!deleteAttachment) {
      throw new BadRequestException('Failed to delete attachment!');
    }
  }

  /**
   * Add Payment to Loan
   *
   * @param {string} id
   * @param {CreatePaymentLoanDTO} payload
   * @return {*}  {Promise<Loan>}
   * @memberof LoanService
   */
  public async pay(
    id: string,
    payload: CreatePaymentLoanDTO,
  ): Promise<LoanDetailResponse> {
    try {
      const createPayment = await getManager().transaction(async (manager) => {
        const {
          user,
          isSuperUser,
          userBranchIds,
        } = await AuthService.getUserBranchAndRole();

        const where = { id, isDeleted: false };
        if (!isSuperUser) {
          Object.assign(where, { branchId: In(userBranchIds) });
        }

        const loan = await manager.getRepository(Loan).findOne({
          where,
          relations: ['branch', 'employee', 'payments'],
        });

        if (!loan) {
          throw new NotFoundException(`Loan with ID ${id} not found!`);
        }

        if (loan.state === LoanState.PAID) {
          throw new BadRequestException(`Loan already paid!`);
        }

        // Keep this here, all related action depends on this field.
        loan.updateUserId = user?.id;

        // Create Payment
        const buildPayment = await this.buildPayment(loan, payload);
        const payment = await this.createPayment(manager, buildPayment);

        // Create AccountStatement (Mutasi Saldo)
        const buildStmt = await this.buildStatement(loan, payment);
        await this.createStatement(manager, buildStmt);

        // Create Journal if Loan has downPayment
        if (loan?.downPaymentId) {
          const journal = await this.buildJournal(manager, loan, payment);
          if (journal) await this.createJournal(manager, journal);
        }

        // Update Loan Payments
        const existingPayments = loan.payments || [];
        loan.payments = existingPayments.concat([payment]);
        loan.paidAmount = loan?.payments
          .map((m) => Number(m.amount))
          .filter((i) => i)
          .reduce((a, b) => a + b, 0);

        const residualAmount = loan.residualAmount - payload.amount;
        if (residualAmount < 0) {
          const residualPaymentAmount = -1 * residualAmount;
          await this.createLoanFromOverPayment(
            manager,
            loan,
            residualPaymentAmount,
          );

          loan.residualAmount = 0;
          loan.state = LoanState.PAID;
        } else {
          loan.residualAmount = residualAmount;
          loan.state = residualAmount === 0 ? LoanState.PAID : LoanState.UNPAID;
        }

        return await manager.save(loan);
      });
      return new LoanDetailResponse(createPayment);
    } catch (error) {
      throw error;
    }
  }

  private async createLoanFromOverPayment(
    manager: EntityManager,
    loan: Loan,
    amount: number,
  ): Promise<Loan> {
    let loanType: LoanType;
    if (loan?.type === LoanType.PAYABLE) {
      loanType = LoanType.RECEIVABLE;
    } else {
      loanType = LoanType.PAYABLE;
    }

    const newLoan = new Loan();
    newLoan.branchId = loan.branchId;
    newLoan.employeeId = loan.employeeId;
    newLoan.transactionDate = new Date();
    newLoan.period = await PeriodService.findByDate(newLoan.transactionDate);
    newLoan.number = GenerateCode.loan();
    newLoan.sourceDocument = loan.number;
    newLoan.amount = amount;
    newLoan.residualAmount = amount;
    newLoan.type = loanType;
    newLoan.createUserId = loan.createUserId;
    newLoan.updateUserId = loan.updateUserId;

    return await manager.save(newLoan);
  }

  private async createPayment(
    manager: EntityManager,
    paymentEntity: AccountPayment,
  ): Promise<AccountPayment> {
    const repo = manager.getRepository(AccountPayment);
    const payment = await repo.save(paymentEntity);
    return payment;
  }

  private async buildPayment(
    loan: Loan,
    payload: CreatePaymentLoanDTO,
  ): Promise<AccountPayment> {
    const payment = new AccountPayment();
    payment.branchId = loan.branchId;
    payment.transactionDate = new Date();
    payment.number = GenerateCode.payment(payment.transactionDate);
    payment.paymentMethod = payload.paymentMethod;
    payment.createUserId = loan.updateUserId;
    payment.updateUserId = loan.updateUserId;

    if (payload.amount >= loan.residualAmount) {
      payment.type = AccountPaymentType.FULL;
      payment.amount = +loan.residualAmount;
    } else if (payload.amount < loan.residualAmount) {
      payment.type = AccountPaymentType.PARTIALLY;
      payment.amount = payload.amount;
    }

    return payment;
  }

  private async createStatement(
    manager: EntityManager,
    stmt: AccountStatement,
  ): Promise<AccountStatement> {
    const repo = manager.getRepository(AccountStatement);
    const statement = await repo.save(stmt);
    // Invalidate Cache Balance
    await BalanceService.invalidateCache(stmt?.branchId);
    return statement;
  }

  private async buildStatement(
    loan: Loan,
    payment: AccountPayment,
  ): Promise<AccountStatement> {
    const stmt = new AccountStatement();
    stmt.description = loan.number;
    stmt.reference = payment.number;
    stmt.sourceType = AccountStatementSourceType.PAYMENT;
    stmt.amount = payment.amount;
    stmt.transactionDate = payment.transactionDate;
    stmt.branchId = payment.branchId;
    stmt.createUserId = payment.createUserId;
    stmt.updateUserId = payment.updateUserId;

    if (payment.paymentMethod === AccountPaymentPayMethod.BANK) {
      stmt.type = AccountStatementType.BANK;
    } else {
      stmt.type = AccountStatementType.CASH;
    }

    if (loan.type === LoanType.PAYABLE) {
      stmt.amountPosition = AccountStatementAmountPosition.CREDIT;
    } else {
      stmt.amountPosition = AccountStatementAmountPosition.DEBIT;
    }

    return stmt;
  }

  private async createJournal(
    manager: EntityManager,
    journal: Journal,
  ): Promise<Journal> {
    const journalRepo = manager.getRepository<Journal>(Journal);
    const periodRepo = manager.getRepository<Period>(Period);
    const period = await periodRepo.findOne({
      where: { id: journal.periodId, isDeleted: false },
      select: ['state'],
    });

    if (!period || period?.state === PeriodState.CLOSE) {
      throw new BadRequestException(
        `Failed create journal due period already closed!`,
      );
    }

    return await journalRepo.save(journal);
  }

  private async buildJournal(
    manager: EntityManager,
    loan: Loan,
    payment: AccountPayment,
  ): Promise<Journal> {
    const branchRepo = manager.getRepository(Branch);
    const branch = await branchRepo.findOne({
      where: { id: payment?.branchId },
      select: ['branchCode'],
    });
    const dpRepo = manager.getRepository(DownPayment);
    const dp = await dpRepo.findOne({
      where: { id: loan?.downPaymentId },
      select: ['id', 'type', 'productId', 'product'],
      relations: ['product'],
    });

    if (!this.canCreateJournal(loan, dp)) return null;

    const j = new Journal();
    j.createUserId = loan?.updateUserId;
    j.updateUserId = loan?.updateUserId;
    j.branchId = payment.branchId;
    j.transactionDate = payment.transactionDate;
    j.periodId = loan.periodId;
    j.number = GenerateCode.journal(payment.transactionDate);
    j.reference = payment.number;
    j.sourceType = JournalSourceType.PAYMENT;
    j.partnerName = loan?.employee?.name;
    j.partnerCode = loan?.employee?.nik;
    j.items = await this.buildJournalItem(loan, payment, dp);
    j.totalAmount = j.items
      .map((m) => Number(m.debit))
      .filter((i) => i)
      .reduce((a, b) => a + b, 0);
    return j;
  }

  /**
   *
   * Internal Helper for Build Journal Item Entity
   * This is contains debit and credit item.
   *
   * receivable / Piutang = Hutang perusahaan terhadap karyawan.
   * payable /  Hutang = Hutang karyawan terhadap perusahaan.
   *
   *  ====== PAYABLE / HUTANG ======
   *  ➡ If DownPayment Type `REIMBURSEMENT`
   *  +--------------------------------------+----------+---------+
   *  | Name                                 | debit   | credit   |
   *  |--------------------------------------+----------+---------|
   *  | Kas Cabang                           | 200000   | 0       |
   *  | Product (e.g: uang muka)             | 0        | 200000  |
   *  +--------------------------------------+----------+---------+
   *
   *  ➡ If DownPayment Type `PERDIN`
   *  +--------------------------------------+----------+---------+
   *  | Name                                 | debit   | credit   |
   *  |--------------------------------------+----------+---------|
   *  | Product (e.g: uang muka)             | 200000   | 0       |
   *  | Kas Cabang                           | 0        | 200000  |
   *  +--------------------------------------+----------+---------+
   *
   *
   *  ====== RECEIVABLE / PIUTANG ======
   *  ➡ If DownPayment Type `PERDIN`
   *  +--------------------------------------+----------+---------+
   *  | Name                                 | debit   | credit   |
   *  |--------------------------------------+----------+---------|
   *  | Product (e.g: uang muka)             | 200000   | 0       |
   *  | Kas Cabang                           | 0        | 200000  |
   *  +--------------------------------------+----------+---------+
   *
   * @private
   * @param {Loan} loan
   * @param {AccountPayment} payment
   * @param {DownPayment} dp
   * @return {*}  {Promise<JournalItem[]>}
   * @memberof LoanService
   */
  private async buildJournalItem(
    loan: Loan,
    payment: AccountPayment,
    dp: DownPayment,
  ): Promise<JournalItem[]> {
    const debit = await this.buildJournalItemDebit(loan, payment, dp);
    const credit = await this.buildJournalItemCredit(loan, payment, dp);

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

  private async buildJournalItemDebit(
    loan: Loan,
    payment: AccountPayment,
    dp: DownPayment,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];

    const i = new JournalItem();
    i.createUserId = loan?.updateUserId;
    i.updateUserId = loan?.updateUserId;
    i.coaId = this.getJournalCoa('debit', loan, dp);
    i.productId = dp?.productId;
    i.branchId = payment.branchId;
    i.transactionDate = payment.transactionDate;
    i.periodId = loan.periodId;
    i.reference = payment.number;
    i.partnerName = loan?.employee?.name;
    i.partnerCode = loan?.employee?.nik;
    i.isLedger = false;
    i.debit = payment.amount;
    items.push(i);

    return items;
  }

  private async buildJournalItemCredit(
    loan: Loan,
    payment: AccountPayment,
    dp: DownPayment,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];

    const i = new JournalItem();
    i.createUserId = loan?.updateUserId;
    i.updateUserId = loan?.updateUserId;
    i.coaId = this.getJournalCoa('credit', loan, dp);
    i.productId = dp?.productId;
    i.branchId = payment.branchId;
    i.transactionDate = payment.transactionDate;
    i.periodId = loan.periodId;
    i.reference = payment.number;
    i.partnerName = loan?.employee?.name;
    i.partnerCode = loan?.employee?.nik;
    i.isLedger = true;
    i.credit = payment.amount;
    items.push(i);

    return items;
  }

  private getJournalCoa(
    type: 'credit' | 'debit',
    loan: Loan,
    dp: DownPayment,
  ): string {
    const isReimbursement = dp?.type === DownPaymentType.REIMBURSEMENT;
    const isPerdin = dp?.type === DownPaymentType.PERDIN;
    const isPayable = loan?.type === LoanType.PAYABLE;
    const isReceivable = loan?.type === LoanType.RECEIVABLE;
    const coaCash = loan?.branch?.cashCoaId;
    const coaProduct = dp?.product?.coaId;

    let coaId: string;

    if (type === 'debit') {
      if (isPayable) {
        if (isReimbursement) {
          coaId = coaCash;
        } else if (isPerdin) {
          coaId = coaCash;
        }
      }

      if (isReceivable) {
        if (isPerdin) {
          coaId = coaProduct;
        }
      }
    }

    if (type === 'credit') {
      if (isPayable) {
        if (isReimbursement) {
          coaId = coaProduct;
        } else if (isPerdin) {
          coaId = coaProduct;
        }
      }

      if (isReceivable) {
        if (isPerdin) {
          coaId = coaCash;
        }
      }
    }

    if (!coaId) throw new NotFoundException(`CoA for ${type} not found!`);

    return coaId;
  }

  /**
   * Check wheter the Loan can create Journal or not.
   *
   * @private
   * @param {Loan} loan
   * @param {DownPayment} dp
   * @return {*}  {boolean}
   * @memberof LoanService
   */
  private canCreateJournal(loan: Loan, dp: DownPayment): boolean {
    let canCreate = false;
    const isReimbursement = dp?.type === DownPaymentType.REIMBURSEMENT;
    const isPerdin = dp?.type === DownPaymentType.PERDIN;
    const isPayable = loan?.type === LoanType.PAYABLE;
    const isReceivable = loan?.type === LoanType.RECEIVABLE;

    if (isPayable) {
      if (isPerdin || isReimbursement) {
        canCreate = true;
      }
    }

    if (isReceivable) {
      if (isPerdin) {
        canCreate = true;
      }
    }

    return canCreate;
  }
}
