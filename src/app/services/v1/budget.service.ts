import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Budget } from '../../../model/budget.entity';
import { QueryBugdetDTO } from '../../domain/budget/budget.payload.dto';
import { BudgetResponse, BudgetWithPaginationResponse } from '../../domain/budget/budget-response.dto';
import { CreateBudgetDTO, UpdateBudgetDTO } from '../../domain/budget/budget-createUpdate.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { getConnection } from "typeorm";

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
    // console.log(budgets[0])
    // return null;
    if(budgets[0]) {
      let start = new Date(budgets[0].endDate);
      start.setDate(start.getDate() + 1);

      let end = new Date(start);
      end.setDate(end.getDate() + 6);

      const budgetDupl = await this.budgetRepo.save({
        id: budgets[0].id,
        branchId: budgets[0].branchId,
        number: GenerateCode.budget(),
        responsibleUserId: await this.getUserId(),
        startDate: start,
        endDate: end,
        minimumAmount: budgets[0].minimumAmount,
        totalAmount: budgets[0].totalAmount,
        state: budgets[0].state,
        rejectedNote: budgets[0].rejectedNote,
        createUserId: await this.getUserId(),
        updateUserId: await this.getUserId()
      });

      if(budgets[0].branchId == budgetDupl.branchId  && budgets[0].endDate <= budgetDupl.endDate) {
        throw new HttpException('This branch already have budget with this daterange!', HttpStatus.BAD_REQUEST);
      } else {
        return new BudgetResponse(budgetDupl);
      }
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

}
