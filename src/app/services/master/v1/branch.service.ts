import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../../model/branch.entity';
import { QueryBranchDTO } from '../../../domain/branch/branch.query.dto';
import { BranchWithPaginationResponse } from '../../../domain/branch/response.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
  ) {}

  public async list(query: QueryBranchDTO): Promise<any> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Branch, 'b', params);

    qb.fieldResolverMap['name__contains'] = 'b.branch_name';
    qb.fieldResolverMap['code__contains'] = 'b.branch_code';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['b.id', 'id'],
      ['b.branch_name', 'name'],
      ['b.branch_code', 'code'],
    );
    qb.andWhere(
      (e) => e.isActive,
      (v) => v.isTrue(),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const branch = await qb.exec();
    return new BranchWithPaginationResponse(branch, params);
  }

  public static async processQueueData(data: any) {
    // TODO: Process Queue data
  }
}
