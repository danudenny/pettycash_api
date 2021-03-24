import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Budget } from '../../../model/budget.entity';
import { QueryBugdetDTO } from '../../domain/budget/budget.payload.dto';
import { BudgetResponse, BudgetWithPaginationResponse } from '../../domain/budget/budget-response.dto';
import { CreateBudgetDTO, UpdateBudgetDTO, RejectBudgetDTO } from '../../domain/budget/budget-createUpdate.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { BudgetState, MASTER_ROLES } from '../../../model/utils/enum';
import { BudgetItem } from '../../../model/budget-item.entity';
import { AuthService } from './auth.service';
import { BudgetHistory } from '../../../model/budget-history.entity';
import { BudgetDetailResponse } from '../../domain/budget/budget-detail-response.dto';
import { truncate } from 'lodash';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @InjectRepository(BudgetItem)
    private readonly budgetItemRepo: Repository<BudgetItem>,
  ) {
  }

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
    } else {
      return await AuthService.getUser();
    }
  }

  private async buildHistory(
    budget: Budget,
    data?: {
      state: BudgetState;
      rejectedNote?: string;
      endDate?: Date;
    },
  ): Promise<BudgetHistory[]> {
    const newHistory = new BudgetHistory();
    newHistory.state = data.state;
    newHistory.rejectedNote = data.rejectedNote;
    newHistory.endDate = data.endDate;
    newHistory.createUser = await this.getUser();
    newHistory.updateUser = await this.getUser();

    const history = [].concat(budget.histories, [
      newHistory,
    ]) as BudgetHistory[];
    return history.filter((v) => v);
  }

  public async list(query?: QueryBugdetDTO): Promise<BudgetWithPaginationResponse> {
    const params = { order: '-minimumAmount', limit: 10, ...query };
    const qb = new QueryBuilder(Budget, 'bgt', params);

    qb.fieldResolverMap['startDate__gte'] = 'bgt.startDate';
    qb.fieldResolverMap['endDate__lte'] = 'bgt.endDate';
    qb.fieldResolverMap['branchId'] = 'bgt.branchId';
    qb.fieldResolverMap['minAmount__gte'] = 'bgt.totalAmount';
    qb.fieldResolverMap['maxAmount__lte'] = 'bgt.totalAmount';
    qb.fieldResolverMap['state'] = 'bgt.state';
    qb.fieldResolverMap['number__icontains'] = 'bgt.number';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['bgt.id', 'id'],
      ['bgt.branch_id', 'branchId'],
      ['br.branch_name', 'branchName'],
      ['bgt.number', 'number'],
      ['bgt.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'responsibleUserFirstName'],
      ['us.last_name', 'responsibleUserLastName'],
      ['us.username', 'responsibleUserUsername'],
      ['bgt.start_date', 'startDate'],
      ['bgt.end_date', 'endDate'],
      ['bgt.minimum_amount', 'minimumAmount'],
      ['bgt.total_amount', 'totalAmount'],
      ['bgt.state', 'state'],
      ['bgt.rejected_note', 'rejectedNote']
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

    const budgets = await qb.exec();
    return new BudgetWithPaginationResponse(budgets, params);
  }

  public async getById(id: string): Promise<BudgetDetailResponse> {
    const budget = await this.budgetRepo.findOne({
      where: { id, isDeleted: false },
      relations: [
        'branch',
        'users',
        'items',
        'items.product',
        'histories',
        'histories.createUser',
      ],
    });

    if (!budget) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }
    return new BudgetDetailResponse(budget);
  }

  public async show(id?: string): Promise<BudgetResponse> {
    const qb = new QueryBuilder(Budget, 'bgt');

    qb.fieldResolverMap['id'] = 'bgt.id';

    qb.selectRaw(
      ['bgt.id', 'id'],
      ['bgt.branch_id', 'branchId'],
      ['br.branch_name', 'branchName'],
      ['bgt.number', 'number'],
      ['bgt.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'firstName'],
      ['us.last_name', 'lastName'],
      ['us.username', 'username'],
      ['bgt.start_date', 'startDate'],
      ['bgt.end_date', 'endDate'],
      ['bgt.minimum_amount', 'minimumAmount'],
      ['bgt.total_amount', 'totalAmount'],
      ['bgt.state', 'state'],
      ['bgt.rejected_note', 'rejectedNote']
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
    qb.andWhere(
      (e) => e.id,
      (v) => v.equals(id),
    );

    const budget = await qb.exec();
    return new BudgetResponse(budget);
  }

  public async getBranch(branchId?: string): Promise<any> {
    const getEndDate = await this.budgetRepo.findOne(
      { branchId, isDeleted: false },
      { order: { endDate: 'DESC' }});
    const start = new Date(getEndDate['endDate']);
    start.setDate(start.getDate() + 1);
    return start;
  }

  public async createOld(data: CreateBudgetDTO): Promise<BudgetResponse> {
    try {
      const budgetDTO = await this.budgetRepo.create(data);

      // Auto generate number if number empty / null
      if (!budgetDTO.number) {
        budgetDTO.number = GenerateCode.budget();
      }

      // generate createdUserId / responsibleUserId from current logged in user
      budgetDTO.responsibleUserId = await this.getUserId();
      budgetDTO.createUserId = await this.getUserId();
      budgetDTO.updateUserId = await this.getUserId();

      const budget = await this.budgetRepo.save(budgetDTO);
      return new BudgetResponse(budget);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async create(data: CreateBudgetDTO): Promise<BudgetResponse> {
    if (data && !data.number) {
      data.number = GenerateCode.budget();
    }

    const user = await this.getUser(true);
    const branchId = user && user.branches && user.branches[0].id;

    // Build BudgetItem
    const items: BudgetItem[] = [];
    let totalAmountItem = 0;
    for (const v of data.items) {
      const item = new BudgetItem();
      item.productId = v.productId;
      item.description = v.description;
      item.amount = v.amount;
      item.createUser = user;
      item.updateUser = user;
      totalAmountItem = totalAmountItem + v.amount;
      items.push(item);
    }

    // Build Budget
    const budget = new Budget();
    budget.branchId = branchId;
    budget.number = data.number;
    budget.responsibleUserId = data.responsibleUserId;
    budget.startDate = data.startDate;
    budget.endDate = data.endDate;
    budget.totalAmount = totalAmountItem;
    budget.minimumAmount = data.minimumAmount;
    budget.rejectedNote = null;
    budget.state = BudgetState.DRAFT;
    budget.histories = await this.buildHistory(budget, {
      state: BudgetState.DRAFT,
      endDate: data.endDate,
    });
    budget.items = items;
    budget.createUser = user;
    budget.updateUser = user;

    const result = await this.budgetRepo.save(budget);
    return new BudgetResponse(result);
  }

  public async createDuplicate(data: CreateBudgetDTO): Promise<BudgetResponse> {
    if (data && !data.number) {
      data.number = GenerateCode.budget();
    }

    const user = await this.getUser(true);
    const branchId = user && user.branches && user.branches[0].id;

    const endDateData = await this.getBranch(branchId);
    const checkDate = new Date(data.startDate);

    if (checkDate >= endDateData) {
      // Build BudgetItem
      const items: BudgetItem[] = [];
      let totalAmountItem = 0;
      for (const v of data.items) {
        const item = new BudgetItem();
        item.productId = v.productId;
        item.description = v.description;
        item.amount = v.amount;
        item.createUser = user;
        item.updateUser = user;
        totalAmountItem = totalAmountItem + v.amount;
        items.push(item);
      }

      // Build Budget
      const budget = new Budget();
      budget.branchId = branchId;
      budget.number = data.number;
      budget.responsibleUserId = data.responsibleUserId;
      budget.startDate = data.startDate;
      budget.endDate = data.endDate;
      budget.totalAmount = totalAmountItem;
      budget.minimumAmount = data.minimumAmount;
      budget.rejectedNote = null;
      budget.state = BudgetState.DRAFT;
      budget.histories = await this.buildHistory(budget, {
        state: BudgetState.DRAFT,
        endDate: data.endDate,
      });
      budget.items = items;
      budget.createUser = user;
      budget.updateUser = user;

      const result = await this.budgetRepo.save(budget);
      return new BudgetResponse(result);
    } else {
      throw new HttpException('Cannot Duplicate, Range Date is not Available!', HttpStatus.BAD_REQUEST);
    }
  }

  public async duplicate(id: string): Promise<BudgetResponse> {

    const qb = new QueryBuilder(Budget, 'bgt', { order: { endDate: 'DESC' }, limit: 1});

    qb.selectRaw(
      ['bgt.branch_id', 'branchId'],
      ['bgt.number', 'number'],
      ['bgt.responsible_user_id', 'responsibleUserId'],
      ['bgt.start_date', 'startDate'],
      ['bgt.end_date', 'endDate'],
      ['bgt.minimum_amount', 'minimumAmount'],
      ['bgt.total_amount', 'totalAmount'],
      ['bgt.state', 'state'],
      ['bgt.rejected_note', 'rejectedNote'],
      ['bgt.create_user_id', 'createUserId'],
      ['bgt.update_user_id', 'updateUserId']
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.id,
      (v) => v.equals(id),
    );

    const budgets = await qb.exec();
    if(budgets[0]) {
      const budgetDupl = await this.budgetRepo.create({
        branchId: budgets[0].branchId,
        number: GenerateCode.budget(),
        responsibleUserId: await this.getUserId(),
        startDate: budgets[0].startDate,
        endDate: budgets[0].endDate,
        minimumAmount: budgets[0].minimumAmount,
        totalAmount: budgets[0].totalAmount,
        state: budgets[0].state,
        rejectedNote: budgets[0].rejectedNote,
        createUserId: await this.getUserId(),
        updateUserId: await this.getUserId()
      });

      const saveBudget = await this.budgetRepo.save(budgetDupl)
      return new BudgetResponse(saveBudget);

    } else {
      throw new HttpException('No branch ID matches!', HttpStatus.BAD_REQUEST);
    }
  }

  public async update(id: string, data: UpdateBudgetDTO): Promise<BudgetResponse> {
    const budgetExist = await this.budgetRepo.findOne({ id, isDeleted: false });
    console.log(budgetExist);
    if (!budgetExist) {
      throw new NotFoundException();
    } else {
      const user = await this.getUser(true);
      const branchId = user && user.branches && user.branches[0].id;

      const endDateData = await this.getBranch(branchId);
      const checkDate = new Date(data.startDate);

      if (checkDate >= endDateData) {
        // Build BudgetItem
        const items: BudgetItem[] = [];
        let totalAmountItem = 0;
        for (const v of data.items) {
          const item = new BudgetItem();
          item.productId = v.productId;
          item.description = v.description;
          item.amount = v.amount;
          item.createUser = budgetExist.createUser;
          item.updateUser = user;
          totalAmountItem = totalAmountItem + v.amount;
          items.push(item);
        }

        // Build Budget
        const budget = new Budget();
        budget.branchId = branchId;
        budget.number = data.number;
        budget.responsibleUserId = data.responsibleUserId;
        budget.startDate = data.startDate;
        budget.endDate = data.endDate;
        budget.totalAmount = totalAmountItem;
        budget.minimumAmount = data.minimumAmount;
        budget.rejectedNote = null;
        budget.state = BudgetState.DRAFT;
        budget.histories = await this.buildHistory(budget, {
          state: BudgetState.DRAFT,
          endDate: data.endDate,
        });
        budget.items = items;
        budget.createUser = budgetExist.createUser;
        budget.updateUser = user;

        const result = await this.budgetRepo.update(id, budget);
        return new BudgetResponse(result as any);
      } else {
        throw new HttpException('Cannot Edit, Range Date is not Available!', HttpStatus.BAD_REQUEST);
      }
    } 
  }

  public async delete(id: string): Promise<any> {
    const budgetExists = await this.budgetRepo.findOne({ id, isDeleted: false });
    if (!budgetExists) {
      throw new NotFoundException();
    }

    // SoftDelete
    const budget = await this.budgetRepo.update(id, { isDeleted: true });
    if (!budget) {
      throw new BadRequestException();
    }
    const budgetItem = await this.budgetItemRepo.update({budgetId: id}, { isDeleted: true });
    if (!budgetItem) {
      throw new BadRequestException();
    }

    return new BudgetResponse();
  }

  // public async approve_by_ss(id: string): Promise<any> {
  //   const budgetExists = await this.budgetRepo.findOne({
  //     where: { id, isDeleted: false },
  //   });
  //   if (!budgetExists) {
  //     throw new NotFoundException(`Budget ID ${id} not found!`);
  //   }

  //   if (budgetExists.state === BudgetState.APPROVED_BY_SS) {
  //     throw new BadRequestException(
  //       `Budget ${budgetExists.number} already approved!`,
  //     );
  //   }

  //   if (budgetExists.state === BudgetState.DRAFT) {
  //     throw new BadRequestException(
  //       `Budget ${budgetExists.number} need approve by SPV first!`,
  //     );
  //   }

  //   const budget = this.budgetRepo.create(budgetExists);
  //   budget.state = BudgetState.APPROVED_BY_SS;
  //   budget.updateUserId = await this.getUserId();

  //   const updateBudget = await this.budgetRepo.save(budget);
  //   if (!updateBudget) {
  //     throw new BadRequestException();
  //   }

  //   return new BudgetResponse(updateBudget as any);
  // }

  // public async approve_by_spv(id: string): Promise<any> {
  //   const budgetExists = await this.budgetRepo.findOne({
  //     where: { id, isDeleted: false },
  //   });
  //   if (!budgetExists) {
  //     throw new NotFoundException(`Budget ID ${id} not found!`);
  //   }

  //   if (budgetExists.state === BudgetState.APPROVED_BY_SPV || budgetExists.state === BudgetState.APPROVED_BY_SS) {
  //     throw new BadRequestException(
  //       `Budget ${budgetExists.number} already approved!`,
  //     );
  //   }

  //   const budget = this.budgetRepo.create(budgetExists);
  //   budget.state = BudgetState.APPROVED_BY_SPV;
  //   budget.updateUserId = await this.getUserId();

  //   const updateBudget = await this.budgetRepo.save(budget);
  //   if (!updateBudget) {
  //     throw new BadRequestException();
  //   }

  //   return new BudgetResponse(updateBudget as any);
  // }

  public async approve(id: string): Promise<any> {
    const budgetExists = await this.budgetRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!budgetExists) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

    const user = await this.getUser(true);
    const userRole = user?.role?.name;

    if (userRole === MASTER_ROLES.SPV_HO) {
      if (budgetExists.state === BudgetState.APPROVED_BY_SPV || budgetExists.state === BudgetState.APPROVED_BY_SS) {
        throw new BadRequestException(
          `Budget ${budgetExists.number} already approved!`,
        );
      }
  
      const budget = this.budgetRepo.create(budgetExists);
      budget.state = BudgetState.APPROVED_BY_SPV;
      budget.updateUserId = await this.getUserId();
  
      const updateBudget = await this.budgetRepo.save(budget);
      if (!updateBudget) {
        throw new BadRequestException();
      }
  
      return new BudgetResponse(updateBudget as any);
    } else if (userRole === MASTER_ROLES.SS_HO) {
      if (budgetExists.state === BudgetState.APPROVED_BY_SS) {
        throw new BadRequestException(
          `Budget ${budgetExists.number} already approved!`,
        );
      }
  
      if (budgetExists.state === BudgetState.DRAFT) {
        throw new BadRequestException(
          `Budget ${budgetExists.number} need approve by SPV first!`,
        );
      }
  
      const budget = this.budgetRepo.create(budgetExists);
      budget.state = BudgetState.APPROVED_BY_SS;
      budget.updateUserId = await this.getUserId();
  
      const updateBudget = await this.budgetRepo.save(budget);
      if (!updateBudget) {
        throw new BadRequestException();
      }
  
      return new BudgetResponse(updateBudget as any);
    } else {
      throw new HttpException('Role is not SPV or SS!', HttpStatus.BAD_REQUEST);
    }
  }

  public async reject(id: string, data: RejectBudgetDTO): Promise<BudgetResponse> {
    const budgetExist = await this.budgetRepo.findOne({ id, isDeleted: false });
    if (!budgetExist) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

    if (budgetExist.state === BudgetState.REJECTED) {
      throw new BadRequestException(
        `Budget ${budgetExist.number} already rejected!`,
      );
    }

    const values = await this.budgetRepo.create(data);
    values.state = BudgetState.REJECTED;
    values.updateUserId = await this.getUserId();

    const budget = await this.budgetRepo.update(id, values);
    return new BudgetResponse(budget as any);
  }


}
