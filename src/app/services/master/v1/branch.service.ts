import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Branch } from '../../../../model/branch.entity';
import { QueryBranchDTO } from '../../../domain/branch/branch.query.dto';
import { BranchWithPaginationResponse } from '../../../domain/branch/response.dto';
import { AuthService } from '../../v1/auth.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
  ) {}

  public async list(query: QueryBranchDTO): Promise<any> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Branch, 'b', params);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranches = user?.branches?.map((v) => v.id);

    qb.fieldResolverMap['name__icontains'] = 'b.branch_name';
    qb.fieldResolverMap['code__icontains'] = 'b.branch_code';

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
    if (userBranches?.length) {
      qb.andWhere(
        (e) => e.id,
        (v) => v.in(userBranches),
      );
    }

    const branch = await qb.exec();
    return new BranchWithPaginationResponse(branch, params);
  }

  public static async processQueueData(data: any) {
    // TODO: Process Queue data
  }
}
