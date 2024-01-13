import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetRequestItemService } from '../services/v1/budget-request-item.service';
import { BudgetRequestItem } from '../../model/budget.request-item.entity';
import { BudgetRequestItemController } from '../controllers/v1/budget-request-item.controller.dto';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetRequestItem])],
  providers: [BudgetRequestItemService],
  controllers: [BudgetRequestItemController],
  exports: [],
})
export class BudgetRequestItemModule {}