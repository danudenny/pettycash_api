import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetItem } from '../../model/budget-item.entity';
import { BudgetItemService } from '../services/v1/budget-item.service';
import { BudgetItemController } from '../controllers/v1/budget-item.controller.dto';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetItem])],
  providers: [
    BudgetItemService,
  ],
  controllers: [BudgetItemController],
  exports: [],
})
export class BudgetItemModule {}
