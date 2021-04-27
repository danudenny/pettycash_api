import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository, createQueryBuilder } from 'typeorm';
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

  // async getUserId() {
  //   // TODO: Use From Authentication User.
  //   return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  // }

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
    newHistory.createUser = await this.getUser(true);
    newHistory.updateUser = await this.getUser(true);

    const history = [].concat(budgetRequest.histories, [
      newHistory,
    ]) as BudgetRequestHistory[];
    return history.filter((v) => v);
  }

  public async list(query?: QueryBudgetRequestDTO): Promise<BudgetRequestWithPaginationResponse> {
    const params = { order: '-totalAmount', limit: 10, ...query };
    const qb = new QueryBuilder(BudgetRequest, 'bgtr', params);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranches = user?.branches?.map((v) => v.id);

    qb.fieldResolverMap['startDate__gte'] = 'bgtr.needDate';
    qb.fieldResolverMap['endDate__lte'] = 'bgtr.needDate';
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
    if (userBranches?.length) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranches),
      );
    }

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
        'histories.createUser.role',
      ],
    });

    if (!budgetRequest) {
      throw new NotFoundException(`Budget Request ID ${id} not found!`);
    }

    budgetRequest.items = budgetRequest.items.filter(function(val) {return val.isDeleted === false;});
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
        .andWhere(`bgt.state = 'approved_by_spv'`)
        .getOne();
  
      if (!bgtExist) {
        throw new NotFoundException('Tidak ditemukan Budget!');
      }
  
      return new BudgetResponse(bgtExist);;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async create(data: CreateBudgetRequestDTO): Promise<BudgetRequestResponse> {
    if (data && !data.number) {
      data.number = GenerateCode.budgetRequest();
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
      totalAmountItem = totalAmountItem + Number(v.amount);
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
    try{
      const updateBudget = await getManager().transaction(async (manager) => {
        const budgetExist = await manager.findOne(BudgetRequest, {
          where: { id: id, isDeleted: false }
        });

        if (!budgetExist) {
          throw new NotFoundException();
        } else {
          if (budgetExist.state !== BudgetRequestState.DRAFT && budgetExist.state !== BudgetRequestState.REJECTED && budgetExist.state !== BudgetRequestState.CANCELED) {
            throw new HttpException('Cannot Edit, Status Budget Request is Not DRAFT!', HttpStatus.BAD_REQUEST);
          } else {
            const user = await this.getUser(true);
            const branchId = user && user.branches && user.branches[0].id;
      
            // Build BudgetRequestItem
            let items: BudgetRequestItem[] = [];
            const budgetItemExist = await manager.find(BudgetRequestItem, {
              where: { budgetRequestId: id, isDeleted: false }
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
                    await this.budgetRequestItemRepo.update(v.id, x)
                  }
                }
              } else {
                const item = new BudgetRequestItem();;
                item.productId = v.productId;
                item.budgetRequestId = id;
                item.description = v.description;
                item.amount = v.amount;
                item.createUser = user;
                item.updateUser = user;
                await this.budgetRequestItemRepo.insert(item)
              }
            }

            // Get Total Amount
            const budgetItemExistNew = await manager.find(BudgetRequestItem, {
              where: { budgetRequestId: id, isDeleted: false }
            });
            for (const y of budgetItemExistNew) {
              totalAmountItem = totalAmountItem + Number(y.amount);
            }
    
            // Build Budget Request
            budgetExist.branchId = branchId;
            budgetExist.budgetId = data.budgetId;
            budgetExist.number = data.number;
            budgetExist.responsibleUserId = data.responsibleUserId;
            budgetExist.needDate = data.needDate;
            budgetExist.totalAmount = totalAmountItem;
            budgetExist.rejectedNote = null;
            budgetExist.state = BudgetRequestState.DRAFT;
            // budgetExist.histories = await this.buildHistory(budgetRequest, {
            //   state: BudgetRequestState.DRAFT,
            //   needDate: data.needDate,
            // });
            // budgetExist.items = items;
            budgetExist.createUser = user;
            budgetExist.updateUser = user;
    
            const result = await this.budgetRequestRepo.save(budgetExist);
            return new BudgetRequestResponse(result as any);
          }
        }
      });
      return updateBudget as any;
    } catch (error) {
      throw new InternalServerErrorException(error);
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
    try{
      const updateBudget = await getManager().transaction(async (manager) => {
        const budgetRequestExists = await manager.findOne(BudgetRequest, {
          where: { id, isDeleted: false },
          relations: ['histories'],
        });

        if (!budgetRequestExists) {
          throw new NotFoundException(`Budget Request ID ${id} not found!`);
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name;

        if (userRole === MASTER_ROLES.OPS) {
          if (budgetRequestExists.state === BudgetRequestState.APPROVED_BY_OPS || budgetRequestExists.state === BudgetRequestState.APPROVED_BY_PIC) {
            throw new BadRequestException(
              `Budget Request ${budgetRequestExists.number} already approved!`,
            );
          }

          const state = BudgetRequestState.APPROVED_BY_OPS;
          const needDate = budgetRequestExists.needDate;

          budgetRequestExists.state = state;
          budgetRequestExists.histories = await this.buildHistory(budgetRequestExists, {
            state,
            needDate
          });
          budgetRequestExists.updateUser = user;

          return await manager.save(budgetRequestExists);
        } else if (userRole === MASTER_ROLES.PIC_HO) {
          if (budgetRequestExists.state === BudgetRequestState.APPROVED_BY_PIC) {
            throw new BadRequestException(
              `Budget Request ${budgetRequestExists.number} already approved!`,
            );
          }

          if (budgetRequestExists.state === BudgetRequestState.DRAFT || budgetRequestExists.state === BudgetRequestState.REJECTED || budgetRequestExists.state === BudgetRequestState.CANCELED) {
            throw new BadRequestException(
              `Budget ${budgetRequestExists.number} need approve by OPS first!`,
            );
          }

          const state = BudgetRequestState.APPROVED_BY_PIC;
          const needDate = budgetRequestExists.needDate;

          budgetRequestExists.state = state;
          budgetRequestExists.histories = await this.buildHistory(budgetRequestExists, {
            state,
            needDate
          });
          budgetRequestExists.updateUser = user;

          return await manager.save(budgetRequestExists);
        } else {
          throw new HttpException('Role is not OPS or PIC!', HttpStatus.BAD_REQUEST);
        }
      })
      return updateBudget;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async reject(id: string, data: RejectBudgetRequestDTO): Promise<BudgetRequest> {
    try {
      const rejectBudget = await getManager().transaction(async (manager) => {
        const budgetRequestExist = await manager.findOne(BudgetRequest, {
          where: { id: id, isDeleted: false },
          relations: ['histories'],
        });

        if (!budgetRequestExist) {
          throw new NotFoundException(`Budget Request ID ${id} not found!`);
        }
    
        if (budgetRequestExist.state === BudgetRequestState.REJECTED) {
          throw new BadRequestException(
            `Budget Request ${budgetRequestExist.number} already rejected!`,
          );
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name as MASTER_ROLES;

        if (!userRole) {
          throw new BadRequestException(
            `Failed to approve Budget Request due unknown user role!`,
          );
        }

        const rejectedNote = data.rejectedNote;
        const state = BudgetRequestState.REJECTED;
        const needDate = budgetRequestExist.needDate;

        budgetRequestExist.state = state;
        budgetRequestExist.histories = await this.buildHistory(budgetRequestExist, {
          state,
          rejectedNote,
          needDate
        });
        budgetRequestExist.updateUser = user;

        return await manager.save(budgetRequestExist);
      });
      return rejectBudget;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async cancel(id: string): Promise<BudgetRequest> {
    try {
      const cancelBudget = await getManager().transaction(async (manager) => {
        const budgetRequestExist = await manager.findOne(BudgetRequest, {
          where: { id: id, isDeleted: false },
          relations: ['histories'],
        });

        if (!budgetRequestExist) {
          throw new NotFoundException(`Budget Request ID ${id} not found!`);
        }
    
        if (budgetRequestExist.state === BudgetRequestState.CANCELED) {
          throw new BadRequestException(
            `Budget ${budgetRequestExist.number} already canceled!`,
          );
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name as MASTER_ROLES;

        if (!userRole) {
          throw new BadRequestException(
            `Failed to approve Budget Request due unknown user role!`,
          );
        }

        const state = BudgetRequestState.CANCELED;
        const needDate = budgetRequestExist.needDate;

        budgetRequestExist.state = state;
        budgetRequestExist.histories = await this.buildHistory(budgetRequestExist, {
          state,
          needDate
        });
        budgetRequestExist.updateUser = user;

        return await manager.save(budgetRequestExist);
      });
      return cancelBudget;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
