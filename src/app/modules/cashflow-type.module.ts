import { Module } from '@nestjs/common';
import { CashflowType } from '../../model/cashflow-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashflowTypeService } from '../services/v1/cashflow-type.service';
import { CashflowTypeController } from '../controllers/v1/cashflow-type.controller';
import { AccountCoa } from '../../model/account-coa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashflowType, AccountCoa])],
  providers: [CashflowTypeService],
  controllers: [CashflowTypeController],
  exports: [],
})
export class CashflowTypeModule {}