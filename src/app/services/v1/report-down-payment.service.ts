import { getManager} from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { DownPayment } from 'src/model/down-payment.entity';
import { QueryReportDownPaymentDTO } from '../../domain/report-down-payment/report-down-payment-query.dto';
import { ReportDownPaymentsWithPaginationResponse } from '../../domain/report-down-payment/report-down-payment-response.dto';

@Injectable()
export class ReportDownPaymentService {

    public async getAllReport(query?: QueryReportDownPaymentDTO,): Promise<ReportDownPaymentsWithPaginationResponse> {
        try {
            const params = { order: '^created_at', limit: 10, ...query };
            const qb = new QueryBuilder(DownPayment, 'dp', params);

            qb.fieldResolverMap['branchId'] = 'dp.branch_id';
            qb.fieldResolverMap['startDate__gte'] = 'dp.transaction_date';
            qb.fieldResolverMap['endDate__lte'] = 'dp.transaction_date';

            qb.applyFilterPagination();
            qb.selectRaw(
                ['dp.id', 'id'],
                ['dp.number', 'number'],
                ['dp.amount', 'amount'],
                ['dp.branch_id', 'branchId'],
                ['dp.expenseId', 'expenseId'],
                ['dp.transaction_date', 'transactionDate'],
                ['exp.total_amount', 'totalRealized'],
                ['brc.branchName', 'branchName'],
            );
            qb.leftJoin((e) => e.branch, 'brc');
            qb.leftJoin((e) => e.department, 'dpr');
            qb.leftJoin((e) => e.expense, 'exp');
            qb.andWhere(
                (e) => e.isDeleted,
                (v) => v.isFalse(),
            );

            if(query && query.realized === 'sudah_realisasi'){
                qb.andWhereIsolated(q =>
                    q.andWhere(
                        e => e.expenseId,
                        w => w.isNotNull(),
                    )
                );
            } else if(query && query.realized === 'belum_realisasi') {
                qb.andWhereIsolated(q =>
                    q.andWhere(
                        e => e.expenseId,
                        w => w.isNull(),
                    )
                );
            }
 
            const reportDownPayment = await qb.exec();

            return new ReportDownPaymentsWithPaginationResponse(reportDownPayment, params);

        } catch (err) {
            throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
        }
    }
    
}
