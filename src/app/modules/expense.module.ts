import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../../model/expense.entity';
import { ExpenseController } from '../controllers/v1/expense.controller';
import { ExpenseService } from '../services/v1/expense.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  providers: [ExpenseService],
  controllers: [ExpenseController],
  exports: [],
})
export class ExpenseModule {}
