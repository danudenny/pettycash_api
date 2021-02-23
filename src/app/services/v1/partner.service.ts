import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Partner } from '../../../model/partner.entity';
import { CreatePartnerDTO } from '../../domain/partner/create.dto';
import { QueryPartnerDTO } from '../../domain/partner/partner.payload.dto';
import {
  PartnerResponse,
  PartnerWithPaginationResponse,
} from '../../domain/partner/response.dto';

export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {}

  private async getUserId() {
    // TODO: Use From Authentication User.
    return '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  }

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
    return new PartnerWithPaginationResponse(partners, params);
  }

  public async create(payload: CreatePartnerDTO) {
    if (payload && !payload.code) {
      payload.code = 'RANDOM_CODE'; // FIXME: Use Random Generator
    }

    const partner = this.partnerRepo.create(payload as Partner);
    partner.createUserId = await this.getUserId();
    partner.updateUserId = await this.getUserId();

    await this.partnerRepo.save(partner);
    return;
  }
}
