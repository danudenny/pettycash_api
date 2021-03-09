import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, getConnection } from 'typeorm';
import { randomStringGenerator as uuid } from '@nestjs/common/utils/random-string-generator.util';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { ExpenseItemAttribute } from '../../../model/expense-item-attribute.entity';
import { ExpenseItem } from '../../../model/expense-item.entity';
import { Expense } from '../../../model/expense.entity';
import { ExpenseState, ExpenseType } from '../../../model/utils/enum';
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
    private readonly attachmentRepo: Repository<Attachment>
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

  public async getById(id?: string): Promise<any> {
    const expense = await getConnection()
      .createQueryBuilder()
      .select([
        "expense.id",
        "expense.transactionDate",
        "expense.number",
        "expense.sourceDocument",
        "expense.totalAmount",
        "expense.differenceAmount",
        "expense.paymentType",
        "items.id",
        "items.productId",
        "items.products.name",
        "product.code",
        "attributes.key",
        "attributes.value",
        "items.description",
        "items.amount",
        "items.picHoAmount",
        "items.ssHoAmount",
        "items.checkedNote",
        "period.id",
        "period.month",
        "period.year",
        "partner.id",
        "partner.name",
        "histories.id",
        "histories.state",
        "histories.rejectedNote",
        "histories.createdAt",
        ]
      )
      .from(Expense, "expense")
      .leftJoin("expense.items", "items")
      .leftJoin('expense.period', 'period')
      .leftJoin('items.product', 'product')
      .leftJoin('items.attributes', 'attributes')
      .leftJoin('expense.partner', 'partner')
      .leftJoin('expense.histories', 'histories')
      .where("expense.id = :id", { id })
      .andWhere("expense.isDeleted = false")
      .getMany();
    return expense
    // const expense = await this.expenseRepo.findOne({
    //   where: { id, isDeleted: false },
    //   relations: [
    //     'items'
    //   ],
    // });
    // if (!expense) {
    //   throw new NotFoundException(`Expense ID ${id} not found!`);
    // }
    // return new ExpenseRelationResponse(expense);
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

  public async deleteAttachment(expenseId: string, attachmentId: string) {
    // TODO: Implement API Delete Expense Attachments
  }
}
