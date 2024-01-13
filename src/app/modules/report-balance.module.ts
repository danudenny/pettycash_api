import { Module } from '@nestjs/common';
import { ReportBalanceService } from '../services/v1/report-balance.service';
import { ReportBalanceController } from '../controllers/v1/report-balance.controller';

@Module({
	controllers: [ReportBalanceController],
	providers: [ReportBalanceService],
})
export class ReportBalanceModule { }
