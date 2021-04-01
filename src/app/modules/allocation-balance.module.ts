import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllocationBalanceController } from '../controllers/v1/allocation-balance.controller';
import { AllocationBalanceService } from '../services/v1/allocation-balance.service';
import { CashBalanceAllocation } from '../../model/cash.balance.allocation.entity';
import { AccountStatementHistory } from '../../model/account-statement-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashBalanceAllocation, AccountStatementHistory])],
  providers: [AllocationBalanceService],
  controllers: [AllocationBalanceController],
  exports: [],
})
export class AllocationBalanceModule {}
