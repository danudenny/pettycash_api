import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBudgetItemDTO, UpdateBudgetItemDTO } from '../../domain/budget-item/budget-item-create.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { BudgetRequestItem } from '../../../model/budget.request-item.entity';
import { QueryBudgetRequestItemDTO } from '../../domain/budget-request-item/budget-request-item.payload.dto';
import { BudgetRequestItemResponse, BudgetRequestItemWithPaginationResponse } from '../../domain/budget-request-item/budget-request-item-response.dto';
import { CreateBudgetRequestItemDTO, UpdateBudgetRequestItemDTO } from '../../domain/budget-request-item/budget-request-item-create.dto';

@Injectable()
export class BudgetRequestItemService {
  constructor(
    @InjectRepository(BudgetRequestItem)
    private readonly budgetRequestRepo: Repository<BudgetRequestItem>,
  ) {
  }

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

  public async list(query?: QueryBudgetRequestItemDTO): Promise<BudgetRequestItemWithPaginationResponse> {
    const params = { order: '^createdAt', limit: 10, ...query };
    const qb = new QueryBuilder(BudgetRequestItem, 'bgt', params);

    qb.fieldResolverMap['productId'] = 'bgt.productId';
    qb.fieldResolverMap['budgetId'] = 'bgt.budgetId';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['bgt.id', 'id'],
      ['bgt.budget_request_id', 'budgetRequestId'],
      ['bgt.product_id', 'productId'],
      ['pr.name', 'productName'],
      ['bgt.description', 'description'],
      ['bgt.amount', 'amount'],
    );
    qb.leftJoin(
      (e) => e.product,
      'pr'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const budgets = await qb.exec();
    return new BudgetRequestItemWithPaginationResponse(budgets, params);
  }

  public async create(data: CreateBudgetRequestItemDTO): Promise<BudgetRequestItemResponse> {
    const budgetDTO = await this.budgetRequestRepo.create(data);
    budgetDTO.createUserId = await this.getUserId();
    budgetDTO.updateUserId = await this.getUserId();

    try {
      const budgetRequestItem = await this.budgetRequestRepo.save(budgetDTO);
      return new BudgetRequestItemResponse(budgetRequestItem);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async find(id?: string): Promise<BudgetRequestItemResponse> {
    const qb = new QueryBuilder(BudgetRequestItem, 'bgt');

    qb.fieldResolverMap['id'] = 'bgt.id';

    qb.selectRaw(
      ['bgt.id', 'id'],
      ['bgt.budget_request_id', 'budgetRequestId'],
      ['bgt.product_id', 'productId'],
      ['pr.name', 'productName'],
      ['bgt.description', 'description'],
      ['bgt.amount', 'amount'],
    );
    qb.leftJoin(
      (e) => e.product,
      'pr'
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
    return new BudgetRequestItemResponse(budget);
  }

  public async update(id: string, data: UpdateBudgetRequestItemDTO): Promise<BudgetRequestItemResponse> {
    const budgetExist = await this.budgetRequestRepo.findOne({ id, isDeleted: false });
    if (!budgetExist) {
      throw new NotFoundException();
    }
    const values = await this.budgetRequestRepo.create(data);
    values.updateUserId = await this.getUserId();

    const budget = await this.budgetRequestRepo.update(id, values);
    return new BudgetRequestItemResponse(budget as any);
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

    return new BudgetRequestItemResponse();
  }

}
