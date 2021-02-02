import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period } from '../../../model/period.entity';
import { PeriodResponse } from '../../domain/period/response.dto';

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
}
