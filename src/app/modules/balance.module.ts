import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountStatement } from '../../model/account-statement.entity';
import { BalanceController } from '../controllers/v1/balance.controller';
import { BalanceService } from '../services/v1/balance.service';
import { CashBalanceAllocation } from '../../model/cash.balance.allocation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountStatement, CashBalanceAllocation])],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [],
})
export class BalanceModule {}
