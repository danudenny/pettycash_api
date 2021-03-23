import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
/**Entity*/
import { DownPayment } from '../../model/down-payment.entity';
import { DownPaymentHistory } from '../../model/down-payment-history.entity';
/**Service*/
import { DownPaymentService } from './../services/v1/down-payment.service';
import { DownPaymentController } from './../controllers/v1/down-payment.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DownPayment,
            DownPaymentHistory
        ]),
    ],
    controllers: [DownPaymentController, ],
    providers: [DownPaymentService, ],
})
export class DownPaymentModule {}
