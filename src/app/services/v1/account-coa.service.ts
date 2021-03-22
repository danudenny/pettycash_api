import { InjectRepository } from '@nestjs/typeorm';
import { AccountCoa } from '../../../model/account-coa.entity';
import { Repository, getManager, Raw } from 'typeorm';
import { AccountCoaWithPaginationResponse } from '../../domain/account-coa/response.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryAccountCoaDTO } from '../../domain/account-coa/account-coa.payload.dto';

export class AccountCoaService {
  constructor(
    @InjectRepository(AccountCoa)
    private readonly coaRepo: Repository<AccountCoa>,
  ) {}

  async list(
    query: QueryAccountCoaDTO,
  ): Promise<AccountCoaWithPaginationResponse> {
    const params = { order: '^code', limit: 25, ...query };
    const qb = new QueryBuilder(AccountCoa, 'c', params);

    qb.fieldResolverMap['id'] = 'c.id';
    qb.fieldResolverMap['code__icontains'] = 'c.code';
    qb.fieldResolverMap['name__icontains'] = 'c.name';

    qb.applyFilterPagination();
    qb.selectRaw(['c.id', 'id'], ['c.code', 'code'], ['c.name', 'name']);

    const coa = await qb.exec();
    return new AccountCoaWithPaginationResponse(coa, params);
  }

  public static async findCoaByCode(code: string): Promise<AccountCoa> {
    const coaRepo = getManager().getRepository(AccountCoa);
    const coa = await coaRepo.findOne({
      where: {
        code: Raw((alias) => `${alias} ILIKE '%${code}%'`),
      },
    });
    return coa;
  }
}
