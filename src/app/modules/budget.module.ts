import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from '../../model/budget.entity';
import { BudgetController } from '../controllers/v1/budget.controller';
import { BudgetService } from '../services/v1/budget.service';
import * as moment from 'moment-timezone';
import { BudgetItem } from '../../model/budget-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, BudgetItem])],
  providers: [
    BudgetService,
  ],
  controllers: [BudgetController],
  exports: [],
})
export class BudgetModule {}


