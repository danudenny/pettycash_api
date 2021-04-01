import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBudgetItemDTO, UpdateBudgetItemDTO } from '../../domain/budget-item/budget-item-create.dto';
import { BudgetItem } from '../../../model/budget-item.entity';
import { BudgetItemResponse, BudgetItemWithPaginationResponse } from '../../domain/budget-item/budgetItem-response.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryBudgetItemDTO } from '../../domain/budget-item/budget-item.payload.dto';

@Injectable()
export class BudgetItemService {
  constructor(
    @InjectRepository(BudgetItem)
    private readonly budgetRepo: Repository<BudgetItem>,
  ) {
  }

  async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

  public async list(query?: QueryBudgetItemDTO): Promise<BudgetItemWithPaginationResponse> {
    const params = { order: '^createdAt', limit: 10, ...query };
    const qb = new QueryBuilder(BudgetItem, 'bgt', params);

    qb.fieldResolverMap['productId'] = 'bgt.productId';
    qb.fieldResolverMap['budgetId'] = 'bgt.budgetId';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['bgt.id', 'id'],
      ['bgt.budget_id', 'budgetId'],
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
    return new BudgetItemWithPaginationResponse(budgets, params);
  }

  public async create(data: CreateBudgetItemDTO): Promise<BudgetItemResponse> {
    const budgetDTO = await this.budgetRepo.create(data);
    budgetDTO.createUserId = await this.getUserId();
    budgetDTO.updateUserId = await this.getUserId();

    try {
      const budgetItem = await this.budgetRepo.save(budgetDTO);
      return new BudgetItemResponse(budgetItem);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async find(id?: string): Promise<BudgetItemResponse> {
    const qb = new QueryBuilder(BudgetItem, 'bgt');

    qb.fieldResolverMap['id'] = 'bgt.id';

    qb.selectRaw(
      ['bgt.id', 'id'],
      ['bgt.budget_id', 'budgetId'],
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
    return new BudgetItemResponse(budget);
  }

  public async update(id: string, data: UpdateBudgetItemDTO): Promise<BudgetItemResponse> {
    const budgetExist = await this.budgetRepo.findOne({ id, isDeleted: false });
    if (!budgetExist) {
      throw new NotFoundException();
    }
    const values = await this.budgetRepo.create(data);
    values.updateUserId = await this.getUserId();

    const budget = await this.budgetRepo.update(id, values);
    return new BudgetItemResponse(budget as any);
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

    return new BudgetItemResponse();
  }

}
