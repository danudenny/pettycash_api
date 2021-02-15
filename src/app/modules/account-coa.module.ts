import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountCoa } from '../../model/account-coa.entity';
import { AccountCoaController } from '../controllers/v1/account-coa.controller';
import { AccountCoaService } from '../services/v1/account-coa.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountCoa])],
  providers: [AccountCoaService],
  controllers: [AccountCoaController],
  exports: [],
})
export class AccountCoaModule {}
