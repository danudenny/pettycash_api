import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Partner } from '../../../model/partner.entity';
import { QueryPartnerDTO } from '../../domain/partner/partner.payload.dto';
import { PartnerResponse } from '../../domain/partner/response.dto';

export class PartnerService {
  constructor() {}

  async list(query: QueryPartnerDTO): Promise<PartnerResponse> {
    const params = { order: '-createdAt', limit: 25, ...query };
    const qb = new QueryBuilder(Partner, 'p', params);

    qb.fieldResolverMap['id'] = 'p.id';
    qb.fieldResolverMap['name__contains'] = 'p.name';
    qb.fieldResolverMap['code__contains'] = 'p.code';
    qb.fieldResolverMap['state'] = 'p.state';
    qb.fieldResolverMap['type'] = 'p."type"';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['p.id', 'id'],
      ['p.code', 'code'],
      ['p.name', 'name'],
      ['p.address', 'address'],
      ['p."type"', 'type'],
      ['p.npwp_number', 'npwpNumber'],
      ['p.id_card_number', 'idCardNumber'],
      ['p.state', 'state'],
      ['p.created_at', 'createdAt'],
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const partners = await qb.exec();
    return new PartnerResponse(partners);
  }
}
