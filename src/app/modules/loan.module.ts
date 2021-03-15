import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '../../model/loan.entity';
import { LoanController } from '../controllers/v1/loan.controller';
import { LoanService } from '../services/v1/loan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  providers: [LoanService],
  controllers: [LoanController],
  exports: [],
})
export class LoanModule {}
