import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../../../model/expense.entity';
import { AuthService } from './auth.service';
import { ExpenseResponse, ExpenseWithPaginationResponse } from '../../domain/expense/response.dto';
import { QueryExpenseDTO } from '../../domain/expense/expense.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { NotFoundException } from '@nestjs/common';

export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  private async getUser() {
    return await AuthService.getUser();
  }

  public async list(query?: QueryExpenseDTO): Promise<ExpenseWithPaginationResponse> {
    // TODO: Implement API List Expense
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(Expense, 'exp', params);

    qb.fieldResolverMap['startDate__gte'] = 'exp.startDate';
    qb.fieldResolverMap['endDate__gte'] = 'exp.endDate';
    qb.fieldResolverMap['branchId'] = 'exp.branchId';
    qb.fieldResolverMap['type'] = 'exp.type';
    qb.fieldResolverMap['totalAmount_gte'] = 'exp.totalAmount';
    qb.fieldResolverMap['totalAmount_lte'] = 'exp.totalAmount';
    qb.fieldResolverMap['state'] = 'exp.state';
    qb.fieldResolverMap['downPaymentNumber__contains'] = 'exp.downPaymentNumber';
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
      ['exp.state', 'state']
    );
    qb.leftJoin(
      (e) => e.branch,
      'brc'
    );
    qb.leftJoin(
      (e) => e.period,
      'per'
    );
    qb.leftJoin(
      (e) => e.accountDownPayment,
      'adp'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const expense = await qb.exec();
    return new ExpenseWithPaginationResponse(expense, params);
  }

  public async getById(id?: string): Promise<ExpenseResponse> {
    // TODO: Implement API Get Expense Detail
    const expense = await this.expenseRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!expense) {
      throw new NotFoundException(`Expense ID ${id} not found!`);
    }
    return new ExpenseResponse(expense as any);
  }

  public async create(payload?: any) {
    // TODO: Implement API Create Expense
  }

  public async approve(expenseId: string, payload?: any) {
    // TODO: Implement API Approve Expense
  }

  public async reject(expenseId: string, payload?: any) {
    // TODO: Implement API Reject Expense
  }

  public async listAttachment(query?: any) {
    // TODO: Implement API List Expense Attachments
  }

  public async createAttachment(expenseId: string, payload?: any) {
    // TODO: Implement API Create Expense Attachments
  }

  public async deleteAttachment(expenseId: string, attachmentId: string) {
    // TODO: Implement API Delete Expense Attachments
  }
}
