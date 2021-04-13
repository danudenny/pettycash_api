import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankBranch } from '../../model/bank-branch.entity';
import { BankBranchController } from '../controllers/master/v1/bank-branch.controller';
import { BankBranchService } from '../services/master/v1/bank-branch.service';

@Module({
  imports: [TypeOrmModule.forFeature([BankBranch])],
  providers: [BankBranchService],
  controllers: [BankBranchController],
  exports: [],
})
export class BankBranchModule {}
