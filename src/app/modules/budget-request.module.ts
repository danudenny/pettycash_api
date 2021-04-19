import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetRequest } from '../../model/budget.request.entity';
import { BudgetRequestItem } from '../../model/budget.request-item.entity';
import { BudgetRequestController } from '../controllers/v1/budget-request.controller';
import { BudgetRequestService } from '../services/v1/budget-request.service';
import { Budget } from '../../model/budget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, BudgetRequest, BudgetRequestItem])],
  providers: [BudgetRequestService],
  controllers: [BudgetRequestController],
  exports: [],
})
export class BudgetRequestModule {}

