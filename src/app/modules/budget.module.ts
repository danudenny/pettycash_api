import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from '../../model/budget.entity';
import { BudgetController } from '../controllers/v1/budget.controller';
import { BudgetService } from '../services/v1/budget.service';
import * as moment from 'moment-timezone';

@Module({
  imports: [TypeOrmModule.forFeature([Budget])],
  providers: [
    BudgetService,
    {
      provide: 'MomentWrapper',
      useValue: moment
    },
  ],
  controllers: [BudgetController],
  exports: [],
})
export class BudgetModule {}
