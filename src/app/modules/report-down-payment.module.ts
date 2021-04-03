import { Module } from '@nestjs/common';
import { ReportDownPaymentService } from './../services/v1/report-down-payment.service';
import { ReportDownPaymentController } from './../controllers/v1/report-down-payment.controller';

@Module({
    controllers: [ReportDownPaymentController,],
    providers: [ReportDownPaymentService,],
})
export class ReportDownPaymentModule { }
