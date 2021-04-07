import { getManager} from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Loan } from '../../../model/loan.entity';
import { DownPayment } from '../../../model/down-payment.entity';
import { ReportDownPaymentDTO } from '../../domain/report-down-payment/report-down-payment.dto';
import { QueryReportDownPaymentDTO } from '../../domain/report-down-payment/report-down-payment-query.dto';
import { ReportDownPaymentsWithPaginationResponse } from '../../domain/report-down-payment/report-down-payment-response.dto';

@Injectable()
export class ReportDownPaymentService {

    public async getAllReport(query?: QueryReportDownPaymentDTO,): Promise<ReportDownPaymentsWithPaginationResponse> {
        try {
            const params = { order: '^created_at', limit: 10, ...query };

            const listReport = await getManager().transaction(async (manager) => {

                const loanEntity = manager.getRepository<Loan>(Loan);

                const qb = new QueryBuilder(DownPayment, 'dp', params);

                qb.fieldResolverMap['branchId'] = 'dp.branch_id';
                qb.fieldResolverMap['startDate__gte'] = 'dp.transaction_date';
                qb.fieldResolverMap['endDate__lte'] = 'dp.transaction_date';

                qb.applyFilterPagination();
                qb.selectRaw(
                    ['dp.id', 'id'],
                    ['dp.number', 'numberDownPayment'],
                    ['brc.branchName', 'branchName'],
                    ['dp.amount', 'amountDownPayment'],
                    ['exp.total_amount', 'totalExpense'],
                    ['exp.number', 'numberExpense'],
                    ['exp.source_document', 'sourceDocumentExpense'],
                    ['dp.transaction_date', 'transactionDate'],
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
                const mapsReportDownPayment: ReportDownPaymentDTO[] = [];

                await reportDownPayment.map(async (result) => {
                    const loan = await loanEntity.findOne({sourceDocument: result.numberExpense});

                    mapsReportDownPayment.push({
                        id: result.id,
                        numberDownPayment: result.numberDownPayment,
                        sourceDocument: result.sourceDocumentExpense,
                        branchName: result.branchName,
                        amountDownPayment: result.amountDownPayment,
                        totalRealized: result.totalExpense,
                        amountRepayment: loan && loan.paidAmount,
                    })
                })

                return mapsReportDownPayment
            })

            return new ReportDownPaymentsWithPaginationResponse(listReport, params);

        } catch (err) {
            throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
        }
    }
    
}
