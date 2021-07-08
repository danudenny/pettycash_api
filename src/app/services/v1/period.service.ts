import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository, Not } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Period } from '../../../model/period.entity';
import {
  PeriodActionResponse,
  PeriodResponse,
} from '../../domain/period/response.dto';
import { PeriodYearResponse } from '../../domain/period/response-year.dto';
import {
  ClosePeriodDTO,
  QueryPeriodDTO,
} from '../../domain/period/period.payload.dto';
import dayjs from 'dayjs';
import {
  ExpenseState,
  JournalState,
  PeriodState,
} from '../../../model/utils/enum';
import { Journal } from '../../../model/journal.entity';
import { Expense } from '../../../model/expense.entity';
import { AuthService } from './auth.service';

@Injectable()
export class PeriodService {
  constructor(
    @InjectRepository(Period) private readonly periodRepo: Repository<Period>,
    @InjectRepository(Journal)
    private readonly journalRepo: Repository<Journal>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
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

  async listYear(): Promise<any> {
    const qb = new QueryBuilder(Period, 'p');
    qb.selectRaw(['p.year', 'year']);
    qb.groupBy((e) => e.year);

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
      p.createUserId = await PeriodService.getUserId();
      p.updateUserId = await PeriodService.getUserId();
      periods.push(p);
    }

    await this.periodRepo.save(periods);
    return;
  }

  async close(
    id: string,
    payload?: ClosePeriodDTO,
  ): Promise<PeriodActionResponse> {
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
      throw new BadRequestException(
        `Can't close period due any open journal transaction!`,
      );
    }

    const openExpense = await this.expenseRepo.findOne({
      where: {
        isDeleted: false,
        periodId: period.id,
        state: ExpenseState.DRAFT,
      },
      select: ['id'],
    });
    if (openExpense) {
      throw new BadRequestException(
        `Can't close period due any open expense transaction!`,
      );
    }

    period.state = PeriodState.CLOSE;
    period.closeDate = dayjs(payload && payload.closeDate).toDate();
    period.closeUserId = await PeriodService.getUserId();
    await this.periodRepo.save(period);

    // Refetch period with closeUser info for FE need! \(o_o)/
    const updatedPeriod = await this.periodRepo.findOne(id, {
      where: { isDeleted: false },
      relations: ['closeUser'],
    });

    return new PeriodActionResponse(updatedPeriod);
  }

  async open(id: string): Promise<PeriodActionResponse> {
    const period = await this.periodRepo.findOne(id, {
      where: { isDeleted: false },
    });

    if (!period) {
      throw new NotFoundException(`Period for ${id} not found!`);
    }

    if (period.state == PeriodState.OPEN) {
      throw new BadRequestException(`Period ${period.name} already open!`);
    }

    period.state = PeriodState.OPEN;
    period.closeDate = null;
    period.closeUser = null;
    await this.periodRepo.save(period);

    return new PeriodActionResponse(period);
  }

  public static async findByDate(date: Date = new Date()): Promise<Period> {
    const period = await getManager()
      .getRepository(Period)
      .findOne({
        where: {
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          isDeleted: false,
        },
      });

    if (!period) {
      throw new NotFoundException(`Period for ${date} not found!`);
    }

    return period;
  }
}
