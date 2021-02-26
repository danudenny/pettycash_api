import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Budget } from '../../../model/budget.entity';
import { QueryBugdetDTO } from '../../domain/budget/budget.payload.dto';
import { BudgetResponse, BudgetWithPaginationResponse } from '../../domain/budget/budget-response.dto';
import { CreateBudgetDTO, UpdateBudgetDTO, RejectBudgetDTO } from '../../domain/budget/budget-createUpdate.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { BudgetState } from '../../../model/utils/enum';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
  ) {
  }

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
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
    qb.fieldResolverMap['number__contains'] = 'bgt.number';

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
      { branchId: branchId, isDeleted: false },
      { order: { endDate: "DESC" }});
    let start = new Date(getEndDate['endDate']);
    start.setDate(start.getDate() + 1);
    return start;
  }

  public async create(data: CreateBudgetDTO): Promise<BudgetResponse> {
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

  public async duplicate(id: string): Promise<BudgetResponse> {

    const qb = new QueryBuilder(Budget, 'bgt', { order: { endDate: "DESC" }, limit: 1});

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
    if (!budgetExist) {
      throw new NotFoundException();
    }
    const values = await this.budgetRepo.create(data);
    values.updateUserId = await this.getUserId();

    const budget = await this.budgetRepo.update(id, values);
    return new BudgetResponse(budget as any);
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

    return new BudgetResponse();
  }

  public async approve_by_ss(id: string): Promise<any> {
    const budgetExists = await this.budgetRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!budgetExists) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

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
  }

  public async approve_by_spv(id: string): Promise<any> {
    const budgetExists = await this.budgetRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!budgetExists) {
      throw new NotFoundException(`Budget ID ${id} not found!`);
    }

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
