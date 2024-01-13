import { Module } from '@nestjs/common';
import { ReportBudgetController } from '../controllers/v1/report-budget.controller';
import { ReportBudgetService } from '../services/v1/report-budget.service';

@Module({
    controllers: [ReportBudgetController],
    providers: [ReportBudgetService],
})
export class ReportBudgetModule { }
