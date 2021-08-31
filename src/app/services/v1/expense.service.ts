import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  getManager,
  EntityManager,
  createQueryBuilder,
  In,
  FindConditions,
} from 'typeorm';
import { randomStringGenerator as uuid } from '@nestjs/common/utils/random-string-generator.util';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { ExpenseItemAttribute } from '../../../model/expense-item-attribute.entity';
import { ExpenseItem } from '../../../model/expense-item.entity';
import { Expense } from '../../../model/expense.entity';
import {
  AccountStatementAmountPosition,
  AccountStatementType,
  AccountTaxGroup,
  AccountTaxPartnerType,
  BalanceType,
  DownPaymentState,
  DownPaymentType,
  ExpenseAssociationType,
  ExpensePaymentType,
  ExpenseState,
  ExpenseType,
  JournalSourceType,
  JournalState,
  LoanSourceType,
  LoanState,
  LoanType,
  MASTER_ROLES,
  PartnerState,
  PartnerType,
  PeriodState,
  ProductTaxType,
} from '../../../model/utils/enum';
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
import { getPercentage } from '../../../shared/utils';
import { RejectExpenseDTO } from '../../domain/expense/reject.dto';
import { Period } from '../../../model/period.entity';
import { ExpenseDetailResponse } from '../../domain/expense/response-detail.dto';
import { DownPayment } from '../../../model/down-payment.entity';
import { Loan } from '../../../model/loan.entity';
import { UpdateExpenseDTO } from '../../domain/expense/update.dto';
import { UpdateExpenseItemDTO } from '../../domain/expense/update-item.dto';
import { AccountStatement } from '../../../model/account-statement.entity';
import { Employee } from '../../../model/employee.entity';
import { LoaderEnv } from '../../../config/loader';
import { UpdateExpenseAttachmentDTO } from '../../domain/expense/update-attachment.dto';
import { AttachmentType } from '../../../model/attachment-type.entity';
import { Vehicle } from '../../../model/vehicle.entity';
import { VehicleTemp } from '../../../model/vehicle-temp.entity';
import { AccountStatementService } from './account-statement.service';
import { BranchService } from '../master/v1/branch.service';
import { AwsS3Service } from '../../../common/services/aws-s3.service';
import { BalanceService } from './balance.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(AccountTax)
    private readonly taxRepo: Repository<AccountTax>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
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

  /**
   * List all Expense with filter.
   *
   * @param {QueryExpenseDTO} [query] Params to filter.
   * @return {*}  {Promise<ExpenseWithPaginationResponse>}
   * @memberof ExpenseService
   */
  public async list(
    query?: QueryExpenseDTO,
  ): Promise<ExpenseWithPaginationResponse> {
    const params = { order: '-updatedAt', limit: 10, ...query };
    const qb = new QueryBuilder(Expense, 'exp', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['startDate__gte'] = 'exp.transaction_date';
    qb.fieldResolverMap['endDate__lte'] = 'exp.transaction_date';
    qb.fieldResolverMap['branchId'] = 'exp.branch_id';
    qb.fieldResolverMap['type'] = 'exp.type';
    qb.fieldResolverMap['totalAmount__gte'] = 'exp.total_amount';
    qb.fieldResolverMap['totalAmount__lte'] = 'exp.total_amount';
    qb.fieldResolverMap['state'] = 'exp.state';
    qb.fieldResolverMap['downPaymentNumber__icontains'] = 'adp.number';
    qb.fieldResolverMap['number__icontains'] = 'exp.number';

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
    qb.leftJoin((e) => e.downPayment, 'adp');
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

    const expense = await qb.exec();
    return new ExpenseWithPaginationResponse(expense, params);
  }

  public async getById(id: string): Promise<ExpenseDetailResponse> {
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();
    const where = { id, isDeleted: false };
    if (!isSuperUser) {
      Object.assign(where, { branchId: In(userBranchIds) });
    }
    const expense = await this.expenseRepo.findOne({
      where,
      relations: [
        'period',
        'branch',
        'partner',
        'employee',
        'downPayment',
        'items',
        'items.product',
        'items.attributes',
        'histories',
        'histories.createUser',
        'histories.createUser.role',
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
    try {
      const createExpense = await getManager().transaction(async (manager) => {
        if (payload && !payload.number) {
          payload.number = GenerateCode.expense();
        }

        if (!(payload?.partnerId || payload?.employeeId)) {
          throw new BadRequestException(
            `Expense data must have 'partnerId' or 'employeeId'!`,
          );
        }

        if (payload?.partnerId && payload?.employeeId) {
          throw new BadRequestException(
            `Please choose either 'partnerId' or 'employeeId' only!`,
          );
        }

        const user = await this.getUser(true);
        const branchId = user && user.branches && user.branches[0].id;
        let downPayment: DownPayment;

        const associationType = payload?.partnerId
          ? ExpenseAssociationType.PARTNER
          : ExpenseAssociationType.EMPLOYEE;
        const associationId = payload?.partnerId || payload?.employeeId;

        // Build ExpenseItem
        const items: ExpenseItem[] = [];
        for (const v of payload.items) {
          const item = new ExpenseItem();
          item.productId = v.productId;
          item.description = v.description;
          item.amount = v.amount;
          item.ssHoAmount = v.amount;
          // FIXME: Optimize this query!
          item.tax = await this.getTaxValue(
            v?.productId,
            associationType,
            associationId,
          );
          item.createUser = user;
          item.updateUser = user;
          item.attributes = v?.attributes?.map((a) => {
            const attr = new ExpenseItemAttribute();
            attr.key = a.key;
            attr.value = a.value;
            attr.updateUser = user;
            attr.createUser = user;
            return attr;
          });
          items.push(item);
        }

        const totalAmount = items
          .map((m) => Number(m.amount))
          .filter((i) => i)
          .reduce((a, b) => a + b, 0);

        // Check balance if Sufficient or not
        await this.checkBalance(branchId, totalAmount, payload?.paymentType);

        // Build Expense
        const expense = new Expense();
        expense.branchId = branchId;
        expense.number = payload.number;
        expense.sourceDocument = payload.sourceDocument;
        expense.transactionDate = payload.transactionDate;
        expense.periodId = payload.periodId;
        expense.partnerId = payload?.partnerId;
        expense.employeeId = payload?.employeeId;
        expense.type = ExpenseType.EXPENSE;
        expense.paymentType = payload.paymentType;
        expense.state = ExpenseState.DRAFT;
        expense.items = items;
        expense.totalAmount = totalAmount;
        expense.histories = await this.buildHistory(expense, {
          state: ExpenseState.DRAFT,
        });
        expense.createUser = user;
        expense.updateUser = user;

        if (payload?.downPaymentId) {
          downPayment = await this.retrieveDownPaymentForExpense(
            manager,
            payload?.downPaymentId,
          );

          expense.type = ExpenseType.DOWN_PAYMENT;
          expense.downPaymentId = downPayment.id;
          expense.downPaymentAmount = downPayment.amount;
          expense.differenceAmount = downPayment.amount - expense.totalAmount;
        }

        const expenseResult = await manager.save(expense);

        // After Expense created we should update DownPayment.expenseId
        if (!!downPayment) {
          downPayment.expenseId = expenseResult?.id;
          downPayment.updateUser = user;
          await manager.save(downPayment);
        }

        return expenseResult;
      });
      return new ExpenseResponse(createExpense);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update Expense
   *
   * @param {string} id
   * @param {CreateExpenseDTO} payload
   * @return {*}  {Promise<ExpenseResponse>}
   * @memberof ExpenseService
   */
  public async update(
    id: string,
    payload?: UpdateExpenseDTO,
  ): Promise<ExpenseResponse> {
    try {
      const updateExpense = await getManager().transaction(async (manager) => {
        if (payload?.partnerId && payload?.employeeId) {
          throw new BadRequestException(
            `Please choose either 'partnerId' or 'employeeId' only!`,
          );
        }

        const {
          userBranchIds,
          isSuperUser,
          user,
        } = await AuthService.getUserBranchAndRole();

        const where = { id, isDeleted: false };
        if (!isSuperUser) {
          Object.assign(where, { branchId: In(userBranchIds) });
        }

        const expenseRepo = manager.getRepository(Expense);
        const exp = await expenseRepo.findOne({ where });

        if (!exp) {
          throw new NotFoundException(`Expense with ID ${id} not found!`);
        }

        if (exp.state !== ExpenseState.DRAFT) {
          throw new UnprocessableEntityException(
            `Only Draft Expense can be updated!`,
          );
        }

        if (payload?.partnerId && !exp?.partnerId) {
          exp.partnerId = payload?.partnerId;
          exp.employeeId = null;
        }

        if (payload?.employeeId && !exp?.employeeId) {
          exp.employeeId = payload?.employeeId;
          exp.partnerId = null;
        }

        exp.transactionDate = payload?.transactionDate ?? exp.transactionDate;
        exp.periodId = payload?.periodId ?? exp.periodId;
        exp.sourceDocument = payload?.sourceDocument ?? exp.sourceDocument;
        exp.paymentType = payload?.paymentType ?? exp.paymentType;
        exp.updateUserId = user?.id;

        if (payload?.downPaymentId) {
          const downPayment = await this.retrieveDownPaymentForExpense(
            manager,
            payload?.downPaymentId,
            true,
          );
          downPayment.expenseId = exp.id;
          downPayment.updateUserId = user.id;
          await manager.save(downPayment);

          exp.downPaymentId = payload?.downPaymentId;
        }

        if (payload?.items) {
          const updatedExpenseItems = await this.recreateAndRetrieveExpenseItems(
            manager,
            exp,
            payload?.items,
          );

          exp.totalAmount = updatedExpenseItems
            .map((m) => Number(m.amount))
            .filter((i) => i)
            .reduce((a, b) => a + b, 0);

          if (exp?.downPaymentId) {
            const downPayment = await this.retrieveDownPaymentForExpense(
              manager,
              exp?.downPaymentId,
              false,
            );
            exp.downPaymentAmount = downPayment.amount;
            exp.differenceAmount = downPayment.amount - exp.totalAmount;
          }
        }

        // Check balance if Sufficient or not
        await this.checkBalance(exp.branchId, exp.totalAmount, exp.paymentType);

        // Update ExpenseItem tax if partner or employee changed and items not updated.
        if ((payload?.partnerId || payload?.employeeId) && !payload?.items) {
          // re-fetch expense with items
          const expense = await expenseRepo.findOne({
            where: { id, isDeleted: false },
            relations: ['items'],
          });
          const associationType: ExpenseAssociationType = payload?.partnerId
            ? ExpenseAssociationType.PARTNER
            : ExpenseAssociationType.EMPLOYEE;
          const associationId = payload?.partnerId || payload?.employeeId;

          await this.updateExpenseItemTax(
            manager,
            expense?.items,
            associationType,
            associationId,
          );
        }

        await manager.save(exp);

        return exp;
      });
      return new ExpenseResponse(updateExpense);
    } catch (error) {
      throw error;
    }
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
          relations: ['attachments', 'partner', 'histories', 'createUser'],
        });
        if (!expense) {
          throw new NotFoundException(`Expense ID ${expenseId} not found!`);
        }

        const isSystemUser =
          LoaderEnv.envs?.APP_SYSTEM_USERNAME === expense?.createUser?.username;
        if (expense?.attachments?.length < 1 && !isSystemUser) {
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
        const userRole = user?.role?.name as MASTER_ROLES;
        expense.updateUser = user;

        // if any payload.items, we should update it first.
        // because the Journal Entries depends on items value.
        let updatedExpenseItem: Expense;
        if (payload.items) {
          await this.updateExpenseItem(manager, payload.items, user);
          // NOTE: we need to refetch expense to get latest `items`,
          updatedExpenseItem = await manager.findOne(Expense, {
            where: { id: expenseId, isDeleted: false },
            relations: ['items'],
          });
          expense.items = updatedExpenseItem.items;
        }

        let state: ExpenseState;
        const currentState = expense.state;
        if (
          [MASTER_ROLES.SS_HO, MASTER_ROLES.SPV_HO].includes(userRole) ||
          isSystemUser
        ) {
          // Approving with same state is not allowed
          if (currentState === ExpenseState.APPROVED_BY_SS_SPV) {
            throw new BadRequestException(
              `Can't approve expense with current state ${currentState}`,
            );
          }

          state = ExpenseState.APPROVED_BY_SS_SPV;

          if (updatedExpenseItem) {
            expense.totalAmount = updatedExpenseItem?.items
              .map((m) => Number(m.ssHoAmount))
              .filter((i) => i)
              .reduce((a, b) => a + b, 0);
          }

          // Check balance if Sufficient or not
          await this.checkBalance(
            expense.branchId,
            expense.totalAmount,
            expense.paymentType,
          );

          // Update or Insert Loan from Expense.
          await this.upsertLoanFromExpense(manager, expense);

          // Update or Insert AccountStatement (Balance) from Expense.
          await this.upsertAccountStatementFromExpense(manager, expense);

          // (Re)Create Journal for SS/SPV HO
          await this.removeJournal(manager, expense);
          const journal = await this.buildJournal(manager, expenseId, userRole);
          await this.createJournal(manager, journal);

          // Update Vehicle Kilometer if any.
          await this.updateVehicleFromExpense(manager, expense);
        }

        if (!state) {
          throw new BadRequestException(
            `Failed to approve expense due unknown user role!`,
          );
        }

        if (expense?.downPaymentAmount !== 0) {
          expense.differenceAmount =
            expense?.downPaymentAmount - expense.totalAmount;
        }

        expense.state = state;
        expense.histories = await this.buildHistory(expense, { state });
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
        // unlink DownPayment if any
        await this.unlinkDownPayment(manager, expense);
        // remove Loan if any
        await this.removeLoan(manager, expense);
        // remove AccountStatement if any
        await this.removeAccountStatement(manager, expense);

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
    const qb = new QueryBuilder(Expense, 'exp', {});

    qb.selectRaw(
      ['exp.id', 'expenseId'],
      ['att.id', 'id'],
      ['att."name"', 'name'],
      ['att.filename', 'fileName'],
      ['att.file_mime', 'fileMime'],
      ['att.url', 'url'],
      ['att.s3_acl', 'S3ACL'],
      ['att."path"', 'S3Key'],
      ['att.bucket_name', 'S3BucketName'],
      ['att.type_id', 'typeId'],
      ['typ.code', 'typeCode'],
      ['typ."name"', 'typeName'],
      ['att.is_checked', 'isChecked'],
    );
    qb.qb.innerJoin(`expense_attachment`, 'ea', 'ea.expense_id = exp.id');
    qb.qb.innerJoin(
      `attachment`,
      'att',
      'att.id = ea.attachment_id AND att.is_deleted IS FALSE',
    );
    qb.qb.leftJoin(
      `attachment_type`,
      'typ',
      'typ.id = att.type_id AND typ.is_active IS TRUE AND typ.is_deleted IS FALSE',
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.id,
      (v) => v.equals(expenseId),
    );
    qb.qb.orderBy('att.updated_at', 'DESC');

    const { CACHE_ATTACHMENT_DURATION_IN_MINUTES } = LoaderEnv.envs;
    const cacheDuration = (CACHE_ATTACHMENT_DURATION_IN_MINUTES || 5) * 60; // in seconds

    qb.qb.cache(`expense:${expenseId}:attachments`, 1000 * (cacheDuration - 5));
    const attachments = await qb.exec();
    if (!attachments) {
      throw new NotFoundException(`Attachments not found!`);
    }

    const signedAttachments = [];
    for (const att of attachments) {
      if (att.S3ACL === 'private') {
        att.url = await AwsS3Service.getSignedUrl(
          att.S3BucketName,
          att.S3Key,
          cacheDuration,
        );
      }
      delete att.S3ACL;
      delete att.S3Key;
      delete att.S3BucketName;
      signedAttachments.push(att);
    }

    return new ExpenseAttachmentResponse(signedAttachments);
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
    attachmentTypeId?: string,
  ): Promise<ExpenseAttachmentResponse> {
    try {
      const createAttachment = await getManager().transaction(
        async (manager) => {
          const expense = await manager.findOne(Expense, {
            where: { id: expenseId, isDeleted: false },
            relations: ['attachments'],
            select: ['id'],
          });
          if (!expense) {
            throw new NotFoundException(
              `Expense with ID ${expenseId} not found!`,
            );
          }

          // Upload file attachments
          let newAttachments: Attachment[];
          let attType: AttachmentType;
          let pathId: string;
          if (files && files.length) {
            if (attachmentTypeId) {
              attType = await manager.findOne(AttachmentType, {
                where: {
                  id: attachmentTypeId,
                  isDeleted: false,
                  isActive: true,
                },
              });
            }

            // TODO: move out as utils
            const getExt = (file: any) => {
              return file?.originalname?.split('.').pop();
            };
            const parseAttTypeName = (attName: string) => {
              return attName
                ?.replace('/', '')
                .split(/\s+/)
                .join(' ')
                .replace(' ', '_')
                .toUpperCase();
            };

            const expensePath = `expense/${expenseId}`;
            const attachments = await AttachmentService.uploadFilesWithCustomName(
              files,
              (file) => {
                let attachmentName: string;
                if (attType?.name) {
                  const attTypeName = parseAttTypeName(attType?.name);
                  const ext = getExt(file);
                  attachmentName = `${attTypeName}.${ext}`;
                } else {
                  attachmentName = `${file.originalname}`;
                }
                return attachmentName;
              },
              (file) => {
                const rid = uuid().split('-')[0];
                if (attType?.name) {
                  const attTypeName = parseAttTypeName(attType?.name);
                  const ext = getExt(file);
                  pathId = `${expensePath}_${rid}_${attTypeName}.${ext}`;
                } else {
                  pathId = `${expensePath}_${rid}_${file.originalname}`;
                }
                return pathId;
              },
              attachmentTypeId,
              manager,
            );
            newAttachments = attachments;
          }

          // Insert Attachment in `expense_attachment`.
          for (const attachment of newAttachments) {
            const iSql = `INSERT INTO expense_attachment (expense_id, attachment_id) VALUES ($1, $2)`;
            await manager.query(iSql, [expenseId, attachment?.id]);
          }

          await manager.update(
            Expense,
            { id: expenseId },
            { updateUser: await this.getUser(), updatedAt: new Date() },
          );
          await manager.connection?.queryResultCache?.remove([
            `expense:${expenseId}:attachments`,
          ]);
          return newAttachments;
        },
      );

      return new ExpenseAttachmentResponse(
        (createAttachment as unknown) as ExpenseAttachmentDTO[],
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update Expense Attachment
   *
   * @param {string} expenseId
   * @param {string} attachmentId
   * @param {UpdateExpenseAttachmentDTO} payload
   * @return {*}  {Promise<void>}
   * @memberof ExpenseService
   */
  public async updateAttachment(
    expenseId: string,
    attachmentId: string,
    payload: UpdateExpenseAttachmentDTO,
  ): Promise<void> {
    const att = await createQueryBuilder('attachment', 'att')
      .leftJoin('expense_attachment', 'eat', 'att.id = eat.attachment_id')
      .where('eat.expense_id = :expenseId', { expenseId })
      .andWhere('eat.attachment_id = :attachmentId', { attachmentId })
      .andWhere('att.isDeleted = false')
      .getOne();

    if (!att) {
      throw new NotFoundException('Tidak ditemukan attachment!');
    }

    const data = this.attachmentRepo.create(payload as Attachment);
    data.updateUser = await this.getUser();

    const updateAttachment = await this.attachmentRepo.update(
      attachmentId,
      data,
    );
    if (!updateAttachment) {
      throw new BadRequestException('Failed to update attachment!');
    }
    await getManager().connection?.queryResultCache?.remove([
      `expense:${expenseId}:attachments`,
    ]);
  }

  public async deleteAttachment(
    expenseId: string,
    attachmentId: string,
  ): Promise<void> {
    // TODO: Implement API Delete Expense Attachments
    const attExist = await createQueryBuilder('attachment', 'att')
      .leftJoin('expense_attachment', 'eat', 'att.id = eat.attachment_id')
      .where('eat.expense_id = :expenseId', { expenseId })
      .andWhere('eat.attachment_id = :attachmentId', { attachmentId })
      .andWhere('att.isDeleted = false')
      .getOne();

    if (!attExist) {
      throw new NotFoundException('Tidak ditemukan attachment!');
    }
    // SoftDelete
    const deleteAttachment = await this.attachmentRepo.update(attachmentId, {
      isDeleted: true,
    });
    if (!deleteAttachment) {
      throw new BadRequestException('Failed to delete attachment!');
    }
    await getManager().connection?.queryResultCache?.remove([
      `expense:${expenseId}:attachments`,
    ]);
  }

  private async getTax(
    productId: string,
    associationType: ExpenseAssociationType,
    associationId: string,
  ): Promise<AccountTax> {
    // FIXME: Refactor to use single query if posible.
    const { JASA, SEWA_ALAT_DAN_KENDARAAN, SEWA_BANGUNAN } = ProductTaxType;
    const { PERSONAL, COMPANY } = PartnerType;
    const isEmployee = associationType === ExpenseAssociationType.EMPLOYEE;
    let tax: AccountTax;
    let taxGroup: AccountTaxGroup;
    let isHasNpwp: boolean = false;
    let partnerType: PartnerType;

    const product = await this.productRepo.findOne(
      { id: productId },
      { select: ['id', 'isHasTax', 'taxType'] },
    );

    if (isEmployee) {
      // FIXME: check if employee has valid npwp or not.
      // const employee = await this.employeeRepo.findOne(
      //   { id: associationId },
      //   { select: ['id', 'npwpNumber'] },
      // );
      // NOTE: based on CR PRD, employee treated like Tax Personal with NPWP.
      partnerType = PERSONAL;
      isHasNpwp = true;
    } else {
      const partner = await this.partnerRepo.findOne(
        { id: associationId },
        { select: ['id', 'type', 'npwpNumber'] },
      );

      partnerType = partner?.type;

      if (partner?.npwpNumber) {
        isHasNpwp = partner?.npwpNumber.length === 15;
      }
    }

    const productHasTax = product?.isHasTax;
    const productTaxType = product?.taxType;
    const taxPartnerType = (partnerType as any) as AccountTaxPartnerType;

    if (productHasTax) {
      const taxWhere: FindConditions<AccountTax> = {
        partnerType: taxPartnerType,
        isHasNpwp,
        isDeleted: false,
      };

      if (productTaxType === JASA) {
        if (partnerType === PERSONAL) {
          taxGroup = AccountTaxGroup.PPH21;
        } else if (partnerType === COMPANY) {
          taxGroup = AccountTaxGroup.PPH23;
        }
      } else if (productTaxType === SEWA_ALAT_DAN_KENDARAAN) {
        taxGroup = AccountTaxGroup.PPH23;
      } else if (productTaxType === SEWA_BANGUNAN) {
        taxGroup = AccountTaxGroup.PPH4A2;
      }

      if (taxGroup) {
        Object.assign(taxWhere, { group: taxGroup });
      }

      tax = await this.taxRepo.findOne({
        where: taxWhere,
        select: ['id', 'taxInPercent', 'coaId', 'group'],
      });
    }

    return tax;
  }

  private async getTaxValue(
    productId: string,
    associationType: ExpenseAssociationType,
    associationId?: string,
  ): Promise<number> {
    if (!associationId) return 0;
    const tax = await this.getTax(productId, associationType, associationId);
    const taxValue = tax?.taxInPercent || 0;
    return taxValue;
  }

  private calculateTax(amount: number, taxValue: number) {
    const val1 = amount / (1 - getPercentage(taxValue));
    const val2 = val1 * getPercentage(taxValue);
    return val2;
  }

  private getAssociationTypeAndId(
    expense: Expense,
  ): { associationType: ExpenseAssociationType; associationId: string } {
    const type = expense?.partnerId
      ? ExpenseAssociationType.PARTNER
      : ExpenseAssociationType.EMPLOYEE;
    const id = expense?.partnerId || expense?.employeeId;
    return { associationType: type, associationId: id };
  }

  /**
   * Internal helper to (re)create ExpenseItem
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} expense
   * @param {UpdateExpenseItemDTO[]} items new expense items to create.
   * @return {*}  {Promise<ExpenseItem[]>} updated expense items.
   * @memberof ExpenseService
   */
  private async recreateAndRetrieveExpenseItems(
    manager: EntityManager,
    expense: Expense,
    items: UpdateExpenseItemDTO[],
  ): Promise<ExpenseItem[]> {
    const expenseItemRepo = manager.getRepository(ExpenseItem);

    // Remove Existing ExpenseItem
    await expenseItemRepo.delete({ expenseId: expense.id });

    // (re)create ExpenseItem
    const expenseItems = await this.buildExpenseItems(expense, items);
    await expenseItemRepo.save(expenseItems);

    return expenseItems;
  }

  private async buildExpenseItems(
    expense: Expense,
    items: UpdateExpenseItemDTO[],
  ): Promise<ExpenseItem[]> {
    const { associationType, associationId } = this.getAssociationTypeAndId(
      expense,
    );
    const uitems: ExpenseItem[] = [];
    for (const v of items) {
      const item = new ExpenseItem();
      item.expenseId = expense?.id;
      item.productId = v?.productId;
      item.description = v?.description;
      item.amount = v?.amount;
      item.ssHoAmount = v?.ssHoAmount ?? v?.amount;
      item.checkedNote = v?.checkedNote;
      // FIXME: Optimize this query!
      item.tax = await this.getTaxValue(
        v?.productId,
        associationType,
        associationId,
      );
      item.createUserId = expense?.updateUserId;
      item.updateUserId = expense?.updateUserId;
      item.attributes = v?.attributes?.map((a: any) => {
        const attr = new ExpenseItemAttribute();
        attr.key = a.key;
        attr.value = a.value;
        attr.updateUserId = expense?.updateUserId;
        attr.createUserId = expense?.updateUserId;
        return attr;
      });
      uitems.push(item);
    }
    return uitems;
  }

  /**
   * Internal Helper for update ExpenseItem tax value.
   *
   * @private
   * @param {EntityManager} manager
   * @param {ExpenseItem[]} items
   * @param {ExpenseAssociationType} associationType
   * @param {string} associationId
   * @return {*}  {Promise<void>}
   * @memberof ExpenseService
   */
  private async updateExpenseItemTax(
    manager: EntityManager,
    items: ExpenseItem[],
    associationType: ExpenseAssociationType,
    associationId: string,
  ): Promise<void> {
    const expenseItemRepo = manager.getRepository(ExpenseItem);
    const user = await AuthService.getUser();

    for (const item of items) {
      item.tax = await this.getTaxValue(
        item?.productId,
        associationType,
        associationId,
      );
      item.updateUserId = user?.id ?? item?.updateUserId;
      await expenseItemRepo.save(item);
    }
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
    // re-fetch expense to get latest updated ExpenseItems
    const expense = await manager.findOne(Expense, {
      where: { id: expenseId, isDeleted: false },
      relations: [
        'items',
        'items.product',
        'partner',
        'employee',
        'branch',
        'downPayment',
      ],
    });

    await BranchService.checkCashCoa(expense?.branchId);

    const j = new Journal();
    j.createUser = user;
    j.updateUser = user;
    j.branchId = expense.branchId;
    j.transactionDate = expense.transactionDate;
    j.periodId = expense.periodId;
    j.number = GenerateCode.journal(expense.transactionDate);
    j.reference = expense.number;
    j.sourceType = JournalSourceType.EXPENSE;
    j.partnerName = expense?.partner?.name ?? expense?.employee?.name;
    j.partnerCode = expense?.partner?.code ?? expense?.employee?.nik;
    j.items = await this.buildJournalItem(expense, userRole);
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
    expense: Expense,
    user: User,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];
    const partnerName = expense?.partner?.name || expense?.employee?.name;
    const partnerCode = expense?.partner?.code || expense?.employee?.nik;

    // If Expense from DownPayment
    if (expense?.downPayment) {
      const downPayment = expense?.downPayment;
      const downPaymentType = downPayment?.type;
      const dpProduct = await getManager()
        .getRepository(Product)
        .findOne({
          where: { id: downPayment?.productId },
          select: ['id', 'coaId'],
        });

      if (downPaymentType === DownPaymentType.PERDIN) {
        const dpJournalItem = new JournalItem();
        dpJournalItem.createUser = user;
        dpJournalItem.updateUser = user;
        dpJournalItem.branchId = expense.branchId;
        dpJournalItem.transactionDate = expense.transactionDate;
        dpJournalItem.periodId = expense.periodId;
        dpJournalItem.reference = expense.number;
        dpJournalItem.description = downPayment?.description;
        dpJournalItem.partnerName = partnerName;
        dpJournalItem.partnerCode = partnerCode;
        dpJournalItem.credit = downPayment?.amount;
        dpJournalItem.coaId = dpProduct?.coaId;
        items.push(dpJournalItem);
      }
    }

    for (const v of expense?.items) {
      const i = new JournalItem();
      i.createUser = user;
      i.updateUser = user;
      i.coaId = expense?.branch?.cashCoaId;
      i.branchId = expense.branchId;
      i.transactionDate = expense.transactionDate;
      i.periodId = expense.periodId;
      i.reference = expense.number;
      i.description = v?.description;
      i.partnerName = partnerName;
      i.partnerCode = partnerCode;
      i.isLedger = false;
      i.expenseItemId = v?.id;
      i.credit = [MASTER_ROLES.SS_HO, MASTER_ROLES.SPV_HO].includes(userRole)
        ? v.ssHoAmount
        : v.amount;
      items.push(i);

      // Add JournalItem for Tax
      if (v?.tax > 0) {
        const { associationType, associationId } = this.getAssociationTypeAndId(
          expense,
        );
        const taxedAmount = this.calculateTax(i.credit, v.tax);
        const tax = await this.getTax(
          v.productId,
          associationType,
          associationId,
        );
        const jTax = new JournalItem();
        jTax.createUser = user;
        jTax.updateUser = user;
        jTax.coaId = tax?.coaId;
        jTax.branchId = expense.branchId;
        jTax.transactionDate = expense.transactionDate;
        jTax.periodId = expense.periodId;
        jTax.reference = expense.number;
        jTax.description = `[${tax?.group} YMH] ${v.description}`;
        jTax.partnerName = partnerName;
        jTax.partnerCode = partnerCode;
        jTax.credit = taxedAmount;
        jTax.isLedger = false;
        jTax.expenseItemId = v?.id;
        items.push(jTax);
      }
    }
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
    expense: Expense,
    user: User,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];
    const partnerName = expense?.partner?.name || expense?.employee?.name;
    const partnerCode = expense?.partner?.code || expense?.employee?.nik;

    // If Expense from DownPayment
    if (expense?.downPayment) {
      const downPayment = expense?.downPayment;
      const downPaymentType = downPayment?.type;

      if (downPaymentType === DownPaymentType.PERDIN) {
        const dpJournalItem = new JournalItem();
        dpJournalItem.createUser = user;
        dpJournalItem.updateUser = user;
        dpJournalItem.branchId = expense.branchId;
        dpJournalItem.transactionDate = expense.transactionDate;
        dpJournalItem.periodId = expense.periodId;
        dpJournalItem.reference = expense.number;
        dpJournalItem.description = downPayment?.description;
        dpJournalItem.partnerName = partnerName;
        dpJournalItem.partnerCode = partnerCode;
        dpJournalItem.coaId = expense?.branch?.cashCoaId;
        dpJournalItem.debit = downPayment?.amount;
        items.push(dpJournalItem);
      }
    }

    for (const v of expense?.items) {
      const i = new JournalItem();
      i.createUser = user;
      i.updateUser = user;
      i.coaId = v?.product?.coaId;
      i.productId = v?.productId;
      i.branchId = expense.branchId;
      i.transactionDate = expense.transactionDate;
      i.periodId = expense.periodId;
      i.reference = expense.number;
      i.description = v?.description;
      i.partnerName = partnerName;
      i.partnerCode = partnerCode;
      i.isLedger = true;
      i.expenseItemId = v?.id;
      i.debit = [MASTER_ROLES.SS_HO, MASTER_ROLES.SPV_HO].includes(userRole)
        ? v.ssHoAmount
        : v.amount;
      items.push(i);

      // Add JournalItem for Tax
      if (v?.tax > 0) {
        const { associationType, associationId } = this.getAssociationTypeAndId(
          expense,
        );
        const taxedAmount = this.calculateTax(i.debit, v.tax);
        const tax = await this.getTax(
          v.productId,
          associationType,
          associationId,
        );
        const jTax = new JournalItem();
        jTax.createUser = user;
        jTax.updateUser = user;
        jTax.coaId = v?.product?.coaId;
        jTax.productId = v?.productId;
        jTax.branchId = expense.branchId;
        jTax.transactionDate = expense.transactionDate;
        jTax.periodId = expense.periodId;
        jTax.reference = expense.number;
        jTax.description = `[${tax?.group} Gross UP] ${v.description}`;
        jTax.partnerName = partnerName;
        jTax.partnerCode = partnerCode;
        jTax.debit = taxedAmount;
        jTax.isLedger = true;
        jTax.expenseItemId = v?.id;
        items.push(jTax);
      }
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
      if (v.ssHoAmount) {
        item.ssHoAmount = v.ssHoAmount;
      }

      // Mark item is valid
      item.isValid = true;

      await expenseItemRepo.update(v.id, item);
    }
  }

  /**
   * Internal helper to retrieve down payment for expense.
   *
   * @private
   * @param {EntityManager} manager
   * @param {string} id DownPayment ID.
   * @param {boolean} [checkRealization=true]
   * @return {*}  {Promise<DownPayment>}
   * @memberof ExpenseService
   */
  private async retrieveDownPaymentForExpense(
    manager: EntityManager,
    id: string,
    checkRealization: boolean = true,
  ): Promise<DownPayment> {
    const downPayment = await manager.getRepository(DownPayment).findOne({
      where: { id, isDeleted: false },
    });

    if (!downPayment) {
      throw new BadRequestException(`Down Payment with ID ${id} not found!`);
    }

    if (downPayment?.type !== DownPaymentType.PERDIN) {
      throw new BadRequestException(
        `Only DownPayment with type PERDIN can be realized!`,
      );
    }

    if (checkRealization) {
      if (downPayment?.expenseId) {
        throw new BadRequestException(`Down Payment already realized!`);
      }
    }

    if (
      ![
        DownPaymentState.APPROVED_BY_PIC_HO,
        DownPaymentState.APPROVED_BY_SS_SPV,
      ].includes(downPayment.state)
    ) {
      throw new BadRequestException(`Down Payment not approved!`);
    }

    return downPayment;
  }

  /**
   * Unlink DownPayment from Expense
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} expense
   * @return {*}  {Promise<void>}
   * @memberof ExpenseService
   */
  private async unlinkDownPayment(
    manager: EntityManager,
    expense: Expense,
  ): Promise<void> {
    if (expense?.downPaymentId) {
      const downPaymentRepo = manager.getRepository(DownPayment);

      const downPayment = await downPaymentRepo.findOne({
        id: expense?.downPaymentId,
      });

      downPayment.expenseId = null;
      // TODO: add history?

      await downPaymentRepo.save(downPayment);
    }
  }

  /**
   * Internal helper to update or insert loan from expense
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} expense
   * @param {CreateExpenseDTO} payload
   * @return {*}  {Promise<DownPayment>}
   * @memberof ExpenseService
   */
  private async upsertLoanFromExpense(
    manager: EntityManager,
    expense: Expense,
  ): Promise<void> {
    // If no DownPayment return
    if (!expense?.downPaymentId) return;

    const downPayment = await manager.getRepository(DownPayment).findOne({
      where: { id: expense?.downPaymentId, isDeleted: false },
    });

    const differenceAmount = downPayment.amount - expense.totalAmount;
    const loan = await this.retrieveLoanForExpense(manager, expense);

    if (!loan) {
      // Create Loan if any `differenceAmount`
      if (differenceAmount !== 0) {
        await this.createLoanFromExpense(manager, expense, downPayment);
      }
    } else {
      await this.updateLoanFromExpense(manager, loan, expense, downPayment);
    }
  }

  private async retrieveLoanForExpense(
    manager: EntityManager,
    expense: Expense,
  ): Promise<Loan> {
    const loan = await manager.getRepository(Loan).findOne({
      where: {
        sourceDocument: expense?.number,
        branchId: expense?.branchId,
        isDeleted: false,
      },
      relations: ['payments'],
    });
    return loan;
  }

  /**
   * Internal helper to create Loan from Expense
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} expense
   * @param {DownPayment} downPayment
   * @return {*}  {Promise<Loan>}
   * @memberof ExpenseService
   */
  private async createLoanFromExpense(
    manager: EntityManager,
    expense: Expense,
    downPayment: DownPayment,
  ): Promise<Loan> {
    // If minus mean Piutang/Receivable otherwise Hutang/Payable.
    // Piutang = Hutang perusahaan terhadap karyawan
    // Hutang = Hutang karyawan terhadap perusahaan
    const differenceAmount = downPayment.amount - expense.totalAmount;
    let loanType: LoanType;
    let loanAmount: number = differenceAmount;

    if (differenceAmount < 0) {
      loanType = LoanType.RECEIVABLE;
      loanAmount = -1 * differenceAmount;
    } else {
      loanType = LoanType.PAYABLE;
    }

    const loan = new Loan();
    loan.branchId = expense.branchId;
    loan.periodId = expense.periodId;
    loan.transactionDate = new Date();
    loan.number = GenerateCode.loan(loan.transactionDate);
    loan.sourceDocument = expense.number;
    loan.sourceType = LoanSourceType.EXPENSE;
    loan.downPaymentId = downPayment?.id;
    loan.type = loanType;
    loan.amount = loanAmount;
    loan.residualAmount = loanAmount;
    loan.employeeId = downPayment?.employeeId;
    loan.createUserId = expense.createUserId;
    loan.updateUserId = expense.updateUserId;

    return await manager.save(loan);
  }

  /**
   * Internal helper to update Loan from Expense
   *
   * @private
   * @param {EntityManager} manager
   * @param {Loan} loan
   * @param {Expense} expense
   * @param {DownPayment} downPayment
   * @return {*}  {Promise<Loan>}
   * @memberof ExpenseService
   */
  private async updateLoanFromExpense(
    manager: EntityManager,
    loan: Loan,
    expense: Expense,
    downPayment: DownPayment,
  ): Promise<any> {
    // If minus mean Piutang/Receivable otherwise Hutang/Payable.
    // Piutang = Hutang perusahaan terhadap karyawan
    // Hutang = Hutang karyawan terhadap perusahaan
    const isLoanHasPayments = loan?.payments?.length > 0;
    const currentDifferenceAmount = expense?.differenceAmount;
    const differenceAmount = downPayment.amount - expense.totalAmount;
    const loanAmount = loan?.amount;
    const paidAmouunt = loan?.paidAmount;
    let loanType: LoanType = loan?.type;
    let newLoanAmount: number;

    if (differenceAmount < 0) {
      newLoanAmount = -1 * differenceAmount;
    } else if (differenceAmount === 0) {
      if (isLoanHasPayments) {
        throw new UnprocessableEntityException(
          `Loan has payments, can't change Expense Amount equal to Loan Amount`,
        );
      } else {
        return await manager.getRepository(Loan).delete({ id: loan?.id });
      }
    } else {
      newLoanAmount = differenceAmount;
    }

    // Amount is same, no need update.
    if (loanAmount === newLoanAmount) return;

    // Change Loan Type if amount sign is difference
    if (Math.sign(currentDifferenceAmount) !== Math.sign(differenceAmount)) {
      if (isLoanHasPayments) {
        throw new UnprocessableEntityException(
          `Loan has payments, can't change Loan Type!`,
        );
      }

      if (loanType === LoanType.RECEIVABLE) {
        loanType = LoanType.PAYABLE;
      } else {
        loanType = LoanType.RECEIVABLE;
      }
    }

    // Update Loan
    loan.type = loanType;
    loan.state = LoanState.UNPAID;
    loan.amount = newLoanAmount;
    loan.residualAmount = newLoanAmount - paidAmouunt;
    loan.updateUserId = expense.updateUserId;

    return await manager.save(loan);
  }

  /**
   * Internal Helper for remove existing loan if no payments.
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} data
   * @return {*}  {Promise<any>}
   * @memberof ExpenseService
   */
  private async removeLoan(
    manager: EntityManager,
    data: Expense,
  ): Promise<any> {
    const loan = await this.retrieveLoanForExpense(manager, data);
    if (!loan) return;

    if (loan?.payments?.length > 0) {
      throw new UnprocessableEntityException(
        `Loan has payments, can't remove it!`,
      );
    }

    return await manager.getRepository(Loan).delete({ id: loan?.id });
  }

  /**
   * Internal Helper for (re)create account statement (balances).
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} expense
   * @return {*}  {Promise<AccountStatement>}
   * @memberof ExpenseService
   */
  private async upsertAccountStatementFromExpense(
    manager: EntityManager,
    expense: Expense,
  ): Promise<AccountStatement> {
    // delete existing statement
    await AccountStatementService.deleteAndUpdateBalance(
      {
        where: {
          reference: expense?.number,
          branchId: expense?.branchId,
          isDeleted: false,
        },
      },
      manager,
    );

    // insert statement if Expense not from DownPayment
    let result: AccountStatement;
    if (!expense?.downPaymentId) {
      const stmt = await this.buildAccountStatement(expense);
      result = await AccountStatementService.createAndUpdateBalance(
        stmt,
        manager,
      );
    }

    return result;
  }

  private async buildAccountStatement(
    expense: Expense,
  ): Promise<AccountStatement> {
    const stmt = new AccountStatement();
    stmt.branchId = expense.branchId;
    stmt.createUser = expense.updateUser;
    stmt.updateUser = expense.updateUser;
    stmt.reference = expense.number;
    stmt.amount = expense.totalAmount;
    stmt.transactionDate = expense.transactionDate;
    stmt.type = (expense.paymentType as unknown) as AccountStatementType;
    stmt.amountPosition = AccountStatementAmountPosition.DEBIT;
    return stmt;
  }

  /**
   * Internal helper to remove existing account statement from expense
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} expense
   * @return {*}  {Promise<void>}
   * @memberof ExpenseService
   */
  private async removeAccountStatement(
    manager: EntityManager,
    expense: Expense,
  ): Promise<void> {
    await AccountStatementService.deleteAndUpdateBalance(
      {
        where: {
          reference: expense?.number,
          branchId: expense?.branchId,
          isDeleted: false,
        },
      },
      manager,
    );
  }

  /**
   * Internal helper to update Vehicle data.
   *
   * @private
   * @param {EntityManager} manager
   * @param {Expense} expense
   * @return {*}  {Promise<void>}
   * @memberof ExpenseService
   */
  private async updateVehicleFromExpense(
    manager: EntityManager,
    expense: Expense,
  ): Promise<void> {
    // re-fetch ExpenseItems to get latest data.
    const expenseItems = await manager.getRepository(ExpenseItem).find({
      where: { expenseId: expense?.id, isDeleted: false },
      relations: ['attributes'],
    });
    for (const item of expenseItems) {
      const attrs = item?.attributes;
      if (!attrs.length) continue;

      const vehicleId = attrs
        ?.filter((a) => a.key === 'vehicleId')
        ?.map((m) => m.value)
        ?.pop();
      const vehicleKM = attrs
        ?.filter((a) => a.key === 'kilometerEnd')
        ?.map((m) => m.value)
        ?.pop();

      if (vehicleId && vehicleKM) {
        if (+vehicleKM > 0) {
          await this.publishUpdateVehicleById(manager, vehicleId, +vehicleKM);
        }
      }
    }
  }

  private async publishUpdateVehicleById(
    manager: EntityManager,
    id: string,
    kmEnd: number,
  ): Promise<any> {
    const vehicleRepo = manager.getRepository(Vehicle);
    const vehicle = await vehicleRepo.findOne(id, {
      select: ['id', 'vehicleId', 'vehicleNumber'],
    });
    if (!vehicle) return;

    // Update Vehicle data in pettycash DB
    const sql = `UPDATE vehicle SET vehicle_kilometer = $2 WHERE id = $1 RETURNING id`;
    await manager?.query(sql, [id, +(kmEnd || 0)]);

    // Insert to VehicleTemp. sync data to masterdata and live table will be handle by other service.
    const vTemp = new VehicleTemp();
    vTemp.pettycashVehicleId = vehicle?.id;
    vTemp.masterdataVehicleId = vehicle?.vehicleId;
    vTemp.vehicleNumber = vehicle?.vehicleNumber;
    vTemp.vehicleKilometer = kmEnd;
    return await manager.save(vTemp);
  }

  private async checkBalance(
    branchId: string,
    amount: number,
    paymentType: ExpensePaymentType,
  ): Promise<void> {
    const isBalanceSufficient = await BalanceService.isSufficient({
      branchId,
      amount,
      type: (paymentType as unknown) as BalanceType,
    });

    if (!isBalanceSufficient) {
      const ttype =
        paymentType === ExpensePaymentType.BANK ? 'Bank' : 'Uang Fisik';
      const errMsg = `Jumlah tidak boleh lebih dari pada Saldo ${ttype} Sistem`;
      throw new UnprocessableEntityException(errMsg);
    }
  }
}
