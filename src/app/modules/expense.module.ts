import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTax } from '../../model/account-tax.entity';
import { Attachment } from '../../model/attachment.entity';
import { Employee } from '../../model/employee.entity';
import { Expense } from '../../model/expense.entity';
import { Partner } from '../../model/partner.entity';
import { Product } from '../../model/product.entity';
import { ExpenseController } from '../controllers/v1/expense.controller';
import { ExpenseService } from '../services/v1/expense.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      AccountTax,
      Partner,
      Employee,
      Product,
      Attachment,
    ]),
  ],
  providers: [ExpenseService],
  controllers: [ExpenseController],
  exports: [],
})
export class ExpenseModule {}
