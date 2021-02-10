import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Period } from '../../../model/period.entity';
import { QueryPeriodYearDTO } from '../../domain/period/period-year.payload.dto';
import { PeriodResponse } from '../../domain/period/response.dto';
import { PeriodYearResponse } from '../../domain/period/response-year.dto';
import {
  ClosePeriodDTO,
  QueryPeriodDTO,
} from '../../domain/period/period.payload.dto';
import dayjs from 'dayjs';
import { AccountExpenseState, JournalState, PeriodState } from '../../../model/utils/enum';
import { Journal } from '../../../model/journal.entity';
import { AccountExpense } from '../../../model/account-expense.entity';

@Injectable()
export class PeriodService {
  constructor(
    @InjectRepository(Period) private readonly periodRepo: Repository<Period>,
    @InjectRepository(Journal) private readonly journalRepo: Repository<Journal>,
    @InjectRepository(AccountExpense) private readonly expenseRepo: Repository<AccountExpense>,
  ) {}

  async getUserId() {
    // TODO: Use From Authentication User.
    const userId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    return userId;
  }

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

  async generate(payload?: any): Promise<any> {
    const year = Number(
      payload && payload.year ? payload.year : dayjs().year(),
    );
    const MAX_YEAR = dayjs().add(1, 'year').year();
    const CURRENT_YEAR = dayjs().year();

    if (year > MAX_YEAR || year < CURRENT_YEAR) {
      throw new BadRequestException(
        `Generate period for year ${year} is not allowed!`,
      );
    }

    const periodExist = await this.periodRepo.findOne({
      where: { year, isDeleted: false },
    });
    if (periodExist) {
      throw new BadRequestException(`Period for year ${year} already exists!`);
    }

    const periods: Period[] = [];
    for (let i = 0; i <= 11; i++) {
      const now = dayjs(`${year}`).month(i);
      const startDate = now.date(1).toDate();
      const endDate = now.date(now.daysInMonth()).toDate();
      const month = now.format('MM');

      const p = new Period();
      p.name = `${month}-${year}`;
      p.startDate = startDate;
      p.endDate = endDate;
      p.month = Number(month);
      p.year = now.year();
      p.createUserId = await this.getUserId();
      p.updateUserId = await this.getUserId();
      periods.push(p);
    }

    await this.periodRepo.save(periods);
    return;
  }

  async close(id: string, payload?: ClosePeriodDTO): Promise<any> {
    const period = await this.periodRepo.findOne(id, {
      where: { isDeleted: false },
    });

    if (!period) {
      throw new NotFoundException(`Period for ${id} not found!`);
    }

    if (period.state == PeriodState.CLOSE) {
      throw new BadRequestException(`Period ${period.name} already closed!`);
    }

    const openJournal = await this.journalRepo.findOne({
      where: {
        isDeleted: false,
        periodId: period.id,
        state: Not(JournalState.POSTED),
      },
      select: ['id'],
    });
    if (openJournal) {
      throw new BadRequestException(`Can't close period due any open journal transaction!`)
    }

    const openExpense = await this.expenseRepo.findOne({
      where: {
        isDeleted: false,
        periodId: period.id,
        state: AccountExpenseState.DRAFT,
      },
      select: ['id'],
    });
    if (openExpense) {
      throw new BadRequestException(`Can't close period due any open expense transaction!`)
    }

    const closeDate = dayjs(payload && payload.closeDate).toDate();
    await this.periodRepo.save({
      ...period,
      state: PeriodState.CLOSE,
      closeDate,
      closeUserId: await this.getUserId(),
    });
    return;
  }

  async open(id: string): Promise<any> {
    const period = await this.periodRepo.findOne(id, {
      where: { isDeleted: false },
    });

    if (!period) {
      throw new NotFoundException(`Period for ${id} not found!`);
    }

    if (period.state == PeriodState.OPEN) {
      throw new BadRequestException(`Period ${period.name} already open!`);
    }

    await this.periodRepo.save({
      ...period,
      state: PeriodState.OPEN,
      closeDate: null,
      closeUserId: null,
    });
    return;
  }
}
