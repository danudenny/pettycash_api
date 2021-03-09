import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../../model/expense.entity';
import { Journal } from '../../model/journal.entity';
import { Period } from '../../model/period.entity';
import { PeriodController } from '../controllers/v1/period.controller';
import { PeriodService } from '../services/v1/period.service';

@Module({
  imports: [TypeOrmModule.forFeature([Period, Journal, Expense])],
  providers: [PeriodService],
  controllers: [PeriodController],
  exports: [],
})
export class PeriodModule {}
