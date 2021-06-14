import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountStatement } from '../../model/account-statement.entity';
import { GlobalSetting } from '../../model/global-setting.entity';
import { BalanceController } from '../controllers/v1/balance.controller';
import { BalanceService } from '../services/v1/balance.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountStatement, GlobalSetting])],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [],
})
export class BalanceModule {}
