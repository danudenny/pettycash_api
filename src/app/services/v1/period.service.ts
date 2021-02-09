import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Period } from '../../../model/period.entity';
import { QueryPeriodYearDTO } from '../../domain/period/period-year.payload.dto';
import { PeriodResponse } from '../../domain/period/response.dto';
import { PeriodYearResponse } from '../../domain/period/response-year.dto';
import { QueryPeriodDTO } from '../../domain/period/period.payload.dto';

@Injectable()
export class PeriodService {
  constructor(
    @InjectRepository(Period) private readonly periodRepo: Repository<Period>,
  ) {}

  async list(query?: QueryPeriodDTO): Promise<PeriodResponse> {
    const params = { order: '-endDate', limit: 12, ...query };
    const qb = new QueryBuilder(Period, 'p', params);

    qb.fieldResolverMap['year'] = 'p.year';
    qb.fieldResolverMap['state'] = 'p.state';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['p.id', 'id'],
      ['p.name', 'name'],
      ['p.month', 'month'],
      ['p.year', 'year'],
      ['p.state', 'state'],
      ['p.is_deleted', 'isDeleted'],
      ['p.close_date', 'closeDate'],
      ['p.close_user_id', 'closeUserId'],
      ['cu.first_name', 'closeUserFirstName'],
      ['cu.last_name', 'closeUserLastName'],
      ['cu.username', 'closeUserNIK'],
    );
    qb.leftJoin(
      (e) => e.closeUser,
      'cu',
      (j) =>
        j.andWhere(
          (e) => e.isDeleted,
          (v) => v.isFalse(),
        ),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const periods = await qb.exec();

    return new PeriodResponse(periods);
  }

  async listYear(query?: QueryPeriodYearDTO): Promise<PeriodYearResponse> {
    const params = { order: '-endDate', limit: 12, ...query };
    const qb = new QueryBuilder(Period, 'p', params);

    qb.fieldResolverMap['year'] = 'p.year';
    qb.fieldResolverMap['state'] = 'p.state';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['p.id', 'id'],
      ['p.name', 'name'],
      ['p.month', 'month'],
      ['p.year', 'year'],
      ['p.state', 'state'],
      ['p.is_deleted', 'isDeleted'],
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const years = await qb.exec();
    return new PeriodYearResponse(years);
  }
}
