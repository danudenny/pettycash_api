import {
  Repository,
  getManager,
  EntityManager,
  createQueryBuilder,
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
import { AccountPaymentType, LoanState } from '../../../model/utils/enum';
import { LoanAttachmentResponse } from '../../domain/loan/response-attachment.dto';
import { Attachment } from '../../../model/attachment.entity';
import { AttachmentService } from '../../../common/services/attachment.service';
import { LoanAttachmentDTO } from '../../domain/loan/loan-attachment.dto';
import { CreateLoanDTO } from '../../domain/loan/create.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';

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
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranches = user?.branches?.map((v) => v.id);

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
    if (userBranches?.length) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranches),
      );
    }

    const loan: LoanDTO[] = await qb.exec();
    return new LoanWithPaginationResponse(loan, params);
  }

  public async getById(id: string) {
    const loan = await this.loanRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['employee', 'payments'],
    });
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
        const loan = await manager.getRepository(Loan).findOne({
          where: { id, isDeleted: false },
          relations: ['employee', 'payments'],
        });

        if (!loan) {
          throw new NotFoundException(`Loan with ID ${id} not found!`);
        }

        if (loan.state === LoanState.PAID) {
          throw new BadRequestException(`Loan already paid!`);
        }

        const user = await AuthService.getUser();
        loan.updateUser = user;

        // Create Payment
        const buildPayment = await this.buildPayment(loan, payload);
        const payment = await this.createPayment(manager, buildPayment);

        // Update Loan Payments
        const existingPayments = loan.payments || [];
        loan.payments = existingPayments.concat([payment]);
        loan.paidAmount = loan?.payments
          .map((m) => Number(m.amount))
          .filter((i) => i)
          .reduce((a, b) => a + b, 0);

        const residualAmount = loan.residualAmount - payload.amount;
        if (residualAmount < 0) {
          const residualPaymentAmount = payload.amount - loan.residualAmount;
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

  private createLoanFromOverPayment(
    manager: EntityManager,
    loan: Loan,
    amount: number,
  ): Promise<Loan> {
    // TODO: Create new Loan from OverPayment
    return;
  }

  private async createPayment(
    manager: EntityManager,
    paymentEntity: AccountPayment,
  ): Promise<AccountPayment> {
    const repo = manager.getRepository(AccountPayment);
    const payment = await repo.save(paymentEntity);

    // TODO: Add Save data to mutasi.kas

    return payment;
  }

  private async buildPayment(
    loan: Loan,
    payload: CreatePaymentLoanDTO,
  ): Promise<AccountPayment> {
    // const residualLoanAmount = this.getResidualLoanAmount(loan, payload);
    const payment = new AccountPayment();
    payment.branchId = loan.branchId;
    payment.transactionDate = new Date();
    payment.paymentMethod = payload.paymentMethod;
    payment.createUser = loan.updateUser;
    payment.updateUser = loan.updateUser;

    if (payload.amount > loan.residualAmount) {
      payment.type = AccountPaymentType.FULL;
      payment.amount = +loan.residualAmount;
    } else if (payload.amount < loan.residualAmount) {
      payment.type = AccountPaymentType.PARTIALLY;
      payment.amount = payload.amount;
    }

    return payment;
  }
}
