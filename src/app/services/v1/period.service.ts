import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Period } from '../../../model/period.entity';
import { QueryPeriodYearDTO } from '../../domain/period/period-year.payload.dto';
import { PeriodResponse } from '../../domain/period/response.dto';
import { PeriodYearResponse } from '../../domain/period/response-year.dto';

@Injectable()
export class PeriodService {
  constructor(
    @InjectRepository(Period) private readonly periodRepo: Repository<Period>,
  ) {}

  async list(query?: any): Promise<any> {
    const periods = await this.periodRepo.find({
      where: { isDeleted: false },
      relations: ['closeUser'],
    });

    return new PeriodResponse(periods);
  }

  async listYear(query?: QueryPeriodYearDTO): Promise<PeriodYearResponse> {
    const qb = new QueryBuilder(Period, 'p', {
      order: '-endDate',
      limit: 12,
      ...query,
    });

    qb.fieldResolverMap['year'] = 'p.year';
    qb.fieldResolverMap['state'] = 'p.state';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['p.id', 'id'],
      ['p.name', 'name'],
      ['p.month', 'month'],
      ['p.year', 'year'],
      ['p.state', 'state'],
    );

    const years = await qb.exec();
    return new PeriodYearResponse(years);
  }
}
