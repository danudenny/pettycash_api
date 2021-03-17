import { Repository, getManager, EntityManager } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Loan } from '../../../model/loan.entity';
import { LoanDTO } from '../../domain/loan/loan.dto';
import { QueryLoanDTO } from '../../domain/loan/loan.query.dto';
import { LoanWithPaginationResponse } from '../../domain/loan/response.dto';
import { LoanDetailResponse } from '../../domain/loan/response-detail.dto';
import { CreatePaymentLoanDTO } from '../../domain/loan/create-payment.dto';
import { AccountPayment } from '../../../model/account-payment.entity';
import { AuthService } from './auth.service';
import { AccountPaymentType, LoanState } from '../../../model/utils/enum';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
  ) {}

  public async list(query?: QueryLoanDTO): Promise<LoanWithPaginationResponse> {
    const params = { ...query };
    const qb = new QueryBuilder(Loan, 'l', params);

    qb.fieldResolverMap['startDate__gte'] = 'l.transactionDate';
    qb.fieldResolverMap['endDate__lte'] = 'l.transactionDate';
    qb.fieldResolverMap['number__icontains'] = 'l.number';
    qb.fieldResolverMap['sourceDocument__icontains'] = 'l.sourceDocument';
    qb.fieldResolverMap['branchId'] = 'l.branchId';
    qb.fieldResolverMap['employeeId'] = 'l.employeeId';
    qb.fieldResolverMap['state'] = 'l.state';
    qb.fieldResolverMap['type'] = 'l.type';
    qb.fieldResolverMap['createdAt'] = 'l.createdAt';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['l.id', 'id'],
      ['l.number', 'number'],
      ['l.transaction_date', 'transactionDate'],
      ['l.type', 'type'],
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
