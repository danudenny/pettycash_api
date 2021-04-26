import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Budget } from '../../../model/budget.entity';
import { QueryBudgetDTO } from '../../domain/budget/budget.payload.dto';
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
      return await AuthService.getUser({ relations: ['branches', 'role'] });
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

  public getDifferenceInDays(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return diffInMs / (1000 * 60 * 60 * 24) + 1;
  }

  public async list(query?: QueryBudgetDTO): Promise<BudgetWithPaginationResponse> {
    const params = { order: '-minimumAmount', limit: 10, ...query };
    const qb = new QueryBuilder(Budget, 'bgt', params);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranches = user?.branches?.map((v) => v.id);

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
    if (userBranches?.length) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranches),
      );
    }

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
        'histories.createUser.role',
      ],
    });

    if (!budget) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

    budget.items = budget.items.filter(function(val) {return val.isDeleted === false;});
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

  public async create(data: CreateBudgetDTO): Promise<BudgetResponse> {
    if (data && !data.number) {
      data.number = GenerateCode.budget();
    }

    const checStartkDate = new Date(data.startDate);
    const checkEndDate = new Date(data.endDate);

    if (checStartkDate >= checkEndDate) {
      throw new HttpException('End Date Cannot Greater Than Start Date!', HttpStatus.BAD_REQUEST);
    } else {
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
        totalAmountItem = totalAmountItem + Number(v.amount);
        items.push(item);
      }

      const date1 = new Date(data.startDate);
      const date2 = new Date(data.endDate);
      const totalDays = await this.getDifferenceInDays(date1, date2);

      // Build Budget
      const budget = new Budget();
      budget.branchId = branchId;
      budget.number = data.number;
      budget.responsibleUserId = data.responsibleUserId;
      budget.startDate = data.startDate;
      budget.endDate = data.endDate;
      budget.totalAmount = totalAmountItem;
      budget.minimumAmount = Number(Math.ceil((totalAmountItem/totalDays)*2));
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
  }

  public async createDuplicate(data: CreateBudgetDTO): Promise<BudgetResponse> {
    if (data && !data.number) {
      data.number = GenerateCode.budget();
    }

    const checStartkDate = new Date(data.startDate);
    const checkEndDate = new Date(data.endDate);

    if (checStartkDate >= checkEndDate) {
      throw new HttpException('End Date Cannot Greater Than Start Date!', HttpStatus.BAD_REQUEST);
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
          item.createUser = user;
          item.updateUser = user;
          totalAmountItem = totalAmountItem + Number(v.amount);
          items.push(item);
        }

        const date1 = new Date(data.startDate);
        const date2 = new Date(data.endDate);
        const totalDays = await this.getDifferenceInDays(date1, date2);
  
        // Build Budget
        const budget = new Budget();
        budget.branchId = branchId;
        budget.number = data.number;
        budget.responsibleUserId = data.responsibleUserId;
        budget.startDate = data.startDate;
        budget.endDate = data.endDate;
        budget.totalAmount = totalAmountItem;
        budget.minimumAmount = Number(Math.ceil((totalAmountItem/totalDays)*2));
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
  }

  public async update(id: string, data: UpdateBudgetDTO): Promise<BudgetResponse> {
    try{
      const updateBudget = await getManager().transaction(async (manager) => {
        const budgetExist = await manager.findOne(Budget, {
          where: { id: id, isDeleted: false }
        });

        if (!budgetExist) {
          throw new NotFoundException();
        } else {
          if (budgetExist.state !== BudgetState.DRAFT && budgetExist.state !== BudgetState.REJECTED && budgetExist.state !== BudgetState.CANCELED) {
            throw new HttpException('Cannot Edit, Status Budget is Not DRAFT, REJECTED OR CANCELED!', HttpStatus.BAD_REQUEST);
          } else {
            const user = await this.getUser(true);
            const branchId = user && user.branches && user.branches[0].id;
      
            // Build BudgetItem
            let items: BudgetItem[] = [];
            const budgetItemExist = await manager.find(BudgetItem, {
              where: { budgetId: id, isDeleted: false }
            });

            let totalAmountItem = 0;
            for (const v of data.items) {
              if (v.id) {
                for (const x of budgetItemExist) {
                  if (v.id === x.id) {
                    x.productId = v.productId;
                    x.description = v.description;
                    x.isDeleted = v.isDeleted;
                    x.amount = v.amount;
                    await this.budgetItemRepo.update(v.id, x)
                  }
                }
              } else {
                const item = new BudgetItem();;
                item.productId = v.productId;
                item.budgetId = id;
                item.description = v.description;
                item.amount = v.amount;
                item.createUser = user;
                item.updateUser = user;
                await this.budgetItemRepo.insert(item)
              }
            }

            // Get Total Amount
            const budgetItemExistNew = await manager.find(BudgetItem, {
              where: { budgetId: id, isDeleted: false }
            });
            for (const y of budgetItemExistNew) {
              totalAmountItem = totalAmountItem + Number(y.amount);
            }
    
            const date1 = new Date(data.startDate);
            const date2 = new Date(data.endDate);
            const totalDays = await this.getDifferenceInDays(date1, date2);

            // Build Budget
            budgetExist.branchId = branchId;
            budgetExist.number = budgetExist.number;
            budgetExist.responsibleUserId = data.responsibleUserId;
            budgetExist.startDate = data.startDate;
            budgetExist.endDate = data.endDate;
            budgetExist.totalAmount = totalAmountItem;
            budgetExist.minimumAmount = Number(Math.ceil((totalAmountItem/totalDays)*2));
            budgetExist.rejectedNote = null;
            budgetExist.state = BudgetState.DRAFT;
            // budgetExist.histories = await this.buildHistory(budgetExist, {
            //   state: BudgetState.DRAFT,
            //   endDate: data.endDate,
            // });
            // if (items.length > 0) {
            //   budgetExist.items = items;
            // }
            budgetExist.createUser = user;
            budgetExist.updateUser = user;
    
            const result = await this.budgetRepo.save(budgetExist);
            return new BudgetResponse(result as any);
          }
        }
      });
      return updateBudget as any;
    } catch (error) {
      throw new InternalServerErrorException(error);
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

  public async approve(id: string): Promise<any> {
    try {
      const approveBudget = await getManager().transaction(async (manager) => {
        const budgetExists = await manager.findOne(Budget, {
          where: { id: id, isDeleted: false },
          relations: ['histories'],
        });

        if (!budgetExists) {
          throw new NotFoundException(`Budget ID ${id} not found!`);
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name;

        if (userRole === MASTER_ROLES.SS_HO) {
          if (budgetExists.state === BudgetState.APPROVED_BY_SPV || budgetExists.state === BudgetState.CONFIRMED_BY_SS) {
            throw new BadRequestException(
              `Budget ${budgetExists.number} already approved!`,
            );
          }
      
          const state = BudgetState.CONFIRMED_BY_SS;
          const endDate = budgetExists.endDate;

          budgetExists.state = state;
          budgetExists.histories = await this.buildHistory(budgetExists, {
            state,
            endDate
          });
          budgetExists.updateUser = user;

          return await manager.save(budgetExists);
        } else if (userRole === MASTER_ROLES.SPV_HO) {
          if (budgetExists.state === BudgetState.APPROVED_BY_SPV) {
            throw new BadRequestException(
              `Budget ${budgetExists.number} already approved!`,
            );
          }
      
          if (budgetExists.state === BudgetState.DRAFT || budgetExists.state === BudgetState.REJECTED) {
            throw new BadRequestException(
              `Budget ${budgetExists.number} need confirmed by SS first!`,
            );
          }

          const state = BudgetState.APPROVED_BY_SPV;
          const endDate = budgetExists.endDate;

          budgetExists.state = state;
          budgetExists.histories = await this.buildHistory(budgetExists, {
            state,
            endDate
          });
          budgetExists.updateUser = user;

          return await manager.save(budgetExists);
        } else {
          throw new HttpException('Role is not SPV or SS!', HttpStatus.BAD_REQUEST);
        }
      })
      return approveBudget;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async reject(id: string, data: RejectBudgetDTO): Promise<Budget> {
    try {
      const rejectBudget = await getManager().transaction(async (manager) => {
        const budgetExist = await manager.findOne(Budget, {
          where: { id: id, isDeleted: false },
          relations: ['histories'],
        });

        if (!budgetExist) {
          throw new NotFoundException(`Budget ID ${id} not found!`);
        }

        if (budgetExist.state === BudgetState.REJECTED) {
          throw new UnprocessableEntityException(`Budget already rejected!`);
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name as MASTER_ROLES;

        if (!userRole) {
          throw new BadRequestException(
            `Failed to approve budget due unknown user role!`,
          );
        }

        const rejectedNote = data.rejectedNote;
        const state = BudgetState.REJECTED;
        const endDate = budgetExist.endDate;

        budgetExist.state = state;
        budgetExist.histories = await this.buildHistory(budgetExist, {
          state,
          rejectedNote,
          endDate
        });
        budgetExist.updateUser = user;

        return await manager.save(budgetExist);
      });
      return rejectBudget;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async cancel(id: string): Promise<Budget> {
    try {
      const cancelBudget = await getManager().transaction(async (manager) => {
        const budgetExist = await manager.findOne(Budget, {
          where: { id: id, isDeleted: false },
          relations: ['histories'],
        });

        if (!budgetExist) {
          throw new NotFoundException(`Budget Request ID ${id} not found!`);
        }
    
        if (budgetExist.state === BudgetState.CANCELED) {
          throw new BadRequestException(
            `Budget ${budgetExist.number} already canceled!`,
          );
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name as MASTER_ROLES;

        if (!userRole) {
          throw new BadRequestException(
            `Failed to approve Budget Request due unknown user role!`,
          );
        }

        const state = BudgetState.CANCELED;
        const endDate = budgetExist.endDate;

        budgetExist.state = state;
        budgetExist.histories = await this.buildHistory(budgetExist, {
          state,
          endDate
        });
        budgetExist.updateUser = user;

        return await manager.save(budgetExist);
      });
      return cancelBudget;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
