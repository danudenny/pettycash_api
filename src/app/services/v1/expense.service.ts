import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { ExpenseItemAttribute } from '../../../model/expense-item-attribute.entity';
import { ExpenseItem } from '../../../model/expense-item.entity';
import { Expense } from '../../../model/expense.entity';
import { ExpenseState, ExpenseType } from '../../../model/utils/enum';
import { CreateExpenseDTO } from '../../domain/expense/create.dto';
import { AuthService } from './auth.service';
import {
  ExpenseResponse,
  ExpenseWithPaginationResponse,
} from '../../domain/expense/response.dto';
import { QueryExpenseDTO } from '../../domain/expense/expense.payload.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { NotFoundException } from '@nestjs/common';
import { AccountTax } from '../../../model/account-tax.entity';
import { Partner } from '../../../model/partner.entity';
import { Product } from '../../../model/product.entity';

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
  ) {}

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
    } else {
      return await AuthService.getUser();
    }
  }

  private async getTaxValue(
    partnerId: string,
    productId: string,
  ): Promise<number> {
    // FIXME: Refactor to use single query if posible.
    let taxValue = null;

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
      const tax = await this.taxRepo.findOne({
        where: {
          partnerType: partner.type,
          isHasNpwp: hasNpwp,
        },
        select: ['id', 'taxInPercent'],
      });
      taxValue = tax && tax.taxInPercent;
    }

    return taxValue;
  }

  public async list(
    query?: QueryExpenseDTO,
  ): Promise<ExpenseWithPaginationResponse> {
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
    expense.downPaymentId = null; // TODO: Add when work in DownPayment feature
    expense.partnerId = payload.partnerId;
    expense.type = ExpenseType.EXPENSE; // TODO: Add condition when work in DownPayment feature.
    expense.paymentType = payload.paymentType;
    expense.state = ExpenseState.DRAFT;
    expense.items = items;
    expense.createUser = user;
    expense.updateUser = user;

    const result = await this.expenseRepo.save(expense);
    return new ExpenseResponse(result);
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
