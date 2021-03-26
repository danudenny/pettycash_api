import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, createQueryBuilder } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Budget } from '../../../model/budget.entity';
import { BudgetResponse } from '../../domain/budget/budget-response.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { BudgetRequestState, MASTER_ROLES } from '../../../model/utils/enum';
import { AuthService } from './auth.service';
import { QueryBudgetRequestDTO } from '../../domain/budget-request/budget-request.payload.dto';
import { BudgetRequestResponse, BudgetRequestWithPaginationResponse } from '../../domain/budget-request/budget-request-response.dto';
import { CreateBudgetRequestDTO, RejectBudgetRequestDTO, UpdateBudgetRequestDTO } from '../../domain/budget-request/budget-request-createUpdate.dto';
import { BudgetRequest } from '../../../model/budget.request.entity';
import { BudgetRequestItem } from '../../../model/budget.request-item.entity';
import { BudgetRequestHistory } from '../../../model/budget.request-history.entity';
import { BudgetRequestDetailResponse } from '../../domain/budget-request/budget-request-detail-response.dto';
import { createProvidersForDecorated } from 'nestjs-pino/dist/InjectPinoLogger';
import { runInThisContext } from 'vm';

@Injectable()
export class BudgetRequestService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @InjectRepository(BudgetRequest)
    private readonly budgetRequestRepo: Repository<BudgetRequest>,
    @InjectRepository(BudgetRequestItem)
    private readonly budgetRequestItemRepo: Repository<BudgetRequestItem>,
  ) {
  }

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches', 'role'] });
    } else {
      return await AuthService.getUser();
    }
  }

  private async buildHistory(
    budgetRequest: BudgetRequest,
    data?: {
      state: BudgetRequestState;
      rejectedNote?: string;
      needDate?: Date;
    },
  ): Promise<BudgetRequestHistory[]> {
    const newHistory = new BudgetRequestHistory();
    newHistory.state = data.state;
    newHistory.rejectedNote = data.rejectedNote;
    newHistory.needDate = data.needDate;
    newHistory.createUser = await this.getUser();
    newHistory.updateUser = await this.getUser();

    const history = [].concat(budgetRequest.histories, [
      newHistory,
    ]) as BudgetRequestHistory[];
    return history.filter((v) => v);
  }

  public async list(query?: QueryBudgetRequestDTO): Promise<BudgetRequestWithPaginationResponse> {
    const params = { order: '-totalAmount', limit: 10, ...query };
    const qb = new QueryBuilder(BudgetRequest, 'bgtr', params);

    qb.fieldResolverMap['startDate__gte'] = 'bgtr.startDate';
    qb.fieldResolverMap['endDate__lte'] = 'bgtr.endDate';
    qb.fieldResolverMap['branchId'] = 'bgtr.branchId';
    qb.fieldResolverMap['minAmount__gte'] = 'bgtr.totalAmount';
    qb.fieldResolverMap['maxAmount__lte'] = 'bgtr.totalAmount';
    qb.fieldResolverMap['state'] = 'bgtr.state';
    qb.fieldResolverMap['number__icontains'] = 'bgtr.number';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['bgtr.id', 'id'],
      ['bgtr.branch_id', 'branchId'],
      ['br.branch_name', 'branchName'],
      ['bgtr.number', 'number'],
      ['bgtr.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'responsibleUserFirstName'],
      ['us.last_name', 'responsibleUserLastName'],
      ['us.username', 'responsibleUserUsername'],
      ['bgtr.need_date', 'needDate'],
      ['bgtr.total_amount', 'totalAmount'],
      ['bgtr.state', 'state'],
      ['bgtr.rejected_note', 'rejectedNote']
    );
    qb.leftJoin(
      (e) => e.branch,
      'br'
    );
    qb.leftJoin(
      (e) => e.users,
      'us'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const budgetsReq = await qb.exec();
    return new BudgetRequestWithPaginationResponse(budgetsReq, params);
  }

  public async getById(id: string): Promise<BudgetRequestDetailResponse> {
    const budgetRequest = await this.budgetRequestRepo.findOne({
      where: { id, isDeleted: false },
      relations: [
        'branch',
        'budget',
        'users',
        'items',
        'items.product',
        'histories',
        'histories.createUser',
      ],
    });

    if (!budgetRequest) {
      throw new NotFoundException(`Budget Request ID ${id} not found!`);
    }
    return new BudgetRequestDetailResponse(budgetRequest);
  }

  public async getBranch(branchId?: string): Promise<any> {
    const getEndDate = await this.budgetRequestRepo.findOne(
      { branchId, isDeleted: false },
      { order: { needDate: 'DESC' }});
    const start = new Date(getEndDate['needDate']);
    start.setDate(start.getDate() + 1);
    return start;
  }

  public async getBudget(needDate?: Date): Promise<BudgetResponse> {
    try {
      
      const bgtExist = await this.budgetRepo.createQueryBuilder('bgt')
        .where(`'${needDate}' BETWEEN bgt.startDate AND bgt.endDate`)
        .getOne();
  
      if (!bgtExist) {
        throw new NotFoundException('Tidak ditemukan Budget!');
      }
  
      return new BudgetResponse(bgtExist);;
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  public async create(data: CreateBudgetRequestDTO): Promise<BudgetRequestResponse> {
    if (data && !data.number) {
      data.number = GenerateCode.budget();
    }

    const user = await this.getUser(true);
    const branchId = user && user.branches && user.branches[0].id;

    // Build BudgetRequestItem
    const items: BudgetRequestItem[] = [];
    let totalAmountItem = 0;
    for (const v of data.items) {
      const item = new BudgetRequestItem();
      item.productId = v.productId;
      item.description = v.description;
      item.amount = v.amount;
      item.createUser = user;
      item.updateUser = user;
      totalAmountItem = totalAmountItem + v.amount;
      items.push(item);
    }

    // Build BudgetRequest
    const budgetRequest = new BudgetRequest();
    budgetRequest.branchId = branchId;
    budgetRequest.budgetId = data.budgetId;
    budgetRequest.number = data.number;
    budgetRequest.responsibleUserId = data.responsibleUserId;
    budgetRequest.needDate = data.needDate;
    budgetRequest.totalAmount = totalAmountItem;
    budgetRequest.rejectedNote = null;
    budgetRequest.state = BudgetRequestState.DRAFT;
    budgetRequest.histories = await this.buildHistory(budgetRequest, {
      state: BudgetRequestState.DRAFT,
      needDate: data.needDate,
    });
    budgetRequest.items = items;
    budgetRequest.createUser = user;
    budgetRequest.updateUser = user;

    const result = await this.budgetRequestRepo.save(budgetRequest);
    return new BudgetRequestResponse(result);
  }

  public async update(id: string, data: UpdateBudgetRequestDTO): Promise<BudgetRequestResponse> {
    const budgetExist = await this.budgetRequestRepo.findOne({ id, isDeleted: false });
    if (!budgetExist) {
      throw new NotFoundException();
    } else {
      const user = await this.getUser(true);
      const branchId = user && user.branches && user.branches[0].id;

      const endDateData = await this.getBranch(branchId);
      const checkDate = new Date(data.needDate);

      if (checkDate >= endDateData) {
        // Build BudgetItem
        const items: BudgetRequestItem[] = [];
        let totalAmountItem = 0;
        for (const v of data.items) {
          const item = new BudgetRequestItem();
          item.productId = v.productId;
          item.description = v.description;
          item.amount = v.amount;
          item.createUser = budgetExist.createUser;
          item.updateUser = user;
          totalAmountItem = totalAmountItem + v.amount;
          items.push(item);
        }

        // Build Budget
        const budgetRequest = new BudgetRequest();
        budgetRequest.branchId = branchId;
        budgetRequest.budgetId = data.budgetId;
        budgetRequest.number = data.number;
        budgetRequest.responsibleUserId = data.responsibleUserId;
        budgetRequest.needDate = data.needDate;
        budgetRequest.totalAmount = totalAmountItem;
        budgetRequest.rejectedNote = null;
        budgetRequest.state = BudgetRequestState.DRAFT;
        budgetRequest.histories = await this.buildHistory(budgetRequest, {
          state: BudgetRequestState.DRAFT,
          needDate: data.needDate,
        });
        budgetRequest.items = items;
        budgetRequest.createUser = budgetExist.createUser;
        budgetRequest.updateUser = user;

        const result = await this.budgetRequestRepo.update(id, budgetRequest);
        return new BudgetRequestResponse(result as any);
      } else {
        throw new HttpException('Cannot Edit, Range Date is not Available!', HttpStatus.BAD_REQUEST);
      }
    } 
  }

  public async delete(id: string): Promise<any> {
    const budgetExists = await this.budgetRequestRepo.findOne({ id, isDeleted: false });
    if (!budgetExists) {
      throw new NotFoundException();
    }

    // SoftDelete
    const budget = await this.budgetRequestRepo.update(id, { isDeleted: true });
    if (!budget) {
      throw new BadRequestException();
    }
    const budgetItem = await this.budgetRequestItemRepo.update({budgetRequestId: id}, { isDeleted: true });
    if (!budgetItem) {
      throw new BadRequestException();
    }

    return new BudgetRequestResponse();
  }

  public async approve(id: string): Promise<any> {
    const budgetRequestExists = await this.budgetRequestRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!budgetRequestExists) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

    const user = await this.getUser(true);
    const userRole = user?.role?.name;

    if (userRole === MASTER_ROLES.OPS) {
      if (budgetRequestExists.state === BudgetRequestState.APPROVED_BY_OPS || budgetRequestExists.state === BudgetRequestState.APPROVED_BY_PIC) {
        throw new BadRequestException(
          `Budget ${budgetRequestExists.number} already approved!`,
        );
      }
  
      const budgetRequest = this.budgetRequestRepo.create(budgetRequestExists);
      budgetRequest.state = BudgetRequestState.APPROVED_BY_OPS;
      budgetRequest.updateUserId = await this.getUserId();
  
      const updateBudget = await this.budgetRequestRepo.save(budgetRequest);
      if (!updateBudget) {
        throw new BadRequestException();
      }
  
      return new BudgetResponse(updateBudget as any);
    } else if (userRole === MASTER_ROLES.PIC_HO) {
      if (budgetRequestExists.state === BudgetRequestState.APPROVED_BY_PIC) {
        throw new BadRequestException(
          `Budget ${budgetRequestExists.number} already approved!`,
        );
      }
  
      if (budgetRequestExists.state === BudgetRequestState.DRAFT) {
        throw new BadRequestException(
          `Budget ${budgetRequestExists.number} need approve by OPS first!`,
        );
      }
  
      const budgetRequest = this.budgetRequestRepo.create(budgetRequestExists);
      budgetRequest.state = BudgetRequestState.APPROVED_BY_PIC;
      budgetRequest.updateUserId = await this.getUserId();
  
      const updateBudgetRequest = await this.budgetRequestRepo.save(budgetRequest);
      if (!updateBudgetRequest) {
        throw new BadRequestException();
      }
  
      return new BudgetRequestResponse(updateBudgetRequest as any);
    } else {
      throw new HttpException('Role is not OPS or PIC!', HttpStatus.BAD_REQUEST);
    }
  }

  public async reject(id: string, data: RejectBudgetRequestDTO): Promise<BudgetRequestResponse> {
    const budgetRequestExist = await this.budgetRequestRepo.findOne({ id, isDeleted: false });
    if (!budgetRequestExist) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

    if (budgetRequestExist.state === BudgetRequestState.REJECTED) {
      throw new BadRequestException(
        `Budget ${budgetRequestExist.number} already rejected!`,
      );
    }

    const values = await this.budgetRequestRepo.create(data);
    values.state = BudgetRequestState.REJECTED;
    values.updateUserId = await this.getUserId();

    const budgetRequest = await this.budgetRequestRepo.update(id, values);
    return new BudgetRequestResponse(budgetRequest as any);
  }

  public async cancel(id: string): Promise<BudgetRequestResponse> {
    const budgetRequestExist = await this.budgetRequestRepo.findOne({ id, isDeleted: false });
    if (!budgetRequestExist) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

    if (budgetRequestExist.state === BudgetRequestState.CANCELED) {
      throw new BadRequestException(
        `Budget ${budgetRequestExist.number} already canceled!`,
      );
    }

    const values = await this.budgetRequestRepo.create();
    values.state = BudgetRequestState.CANCELED;
    values.updateUserId = await this.getUserId();

    const budgetRequest = await this.budgetRequestRepo.update(id, values);
    return new BudgetRequestResponse(budgetRequest as any);
  }


}
