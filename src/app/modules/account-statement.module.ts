import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountStatement } from '../../model/account-statement.entity';
import { AccountStatementController } from '../controllers/v1/account-statement.controller';
import { AccountStatementService } from '../services/v1/account-statement.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountStatement])],
  providers: [AccountStatementService],
  controllers: [AccountStatementController],
  exports: [],
})
export class AccountStatementModule {}
