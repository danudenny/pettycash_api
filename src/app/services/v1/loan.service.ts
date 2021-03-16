import { Injectable } from '@nestjs/common';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Loan } from '../../../model/loan.entity';
import { LoanDTO } from '../../domain/loan/loan.dto';
import { QueryLoanDTO } from '../../domain/loan/loan.query.dto';
import { LoanWithPaginationResponse } from '../../domain/loan/response.dto';

@Injectable()
export class LoanService {
  constructor() {}

  public async list(query?: QueryLoanDTO): Promise<LoanWithPaginationResponse> {
    const params = { ...query };
    const qb = new QueryBuilder(Loan, 'l', params);

    qb.fieldResolverMap['startDate__gte'] = 'l.transactionDate';
    qb.fieldResolverMap['endDate__lte'] = 'l.transactionDate';
    qb.fieldResolverMap['number__icontains'] = 'l.number';
    qb.fieldResolverMap['sourceDocument__icontains'] = 'l.sourceDocument';
    qb.fieldResolverMap['branchId'] = 'l.branchId';
    qb.fieldResolverMap['employeeId'] = 'l.employeeId';
    qb.fieldResolverMap['state'] = 'l.state';
    qb.fieldResolverMap['type'] = 'l.type';
    qb.fieldResolverMap['createdAt'] = 'l.createdAt';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['l.id', 'id'],
      ['l.number', 'number'],
      ['l.transaction_date', 'transactionDate'],
      ['l.type', 'type'],
      ['l.amount', 'amount'],
      ['l.residual_amount', 'residualAmount'],
      ['l.paid_amount', 'paidAmount'],
      ['l.source_document', 'sourceDocument'],
      ['l.created_at', 'createdAt'],
      ['p.month', 'periodMonth'],
      ['p.year', 'periodYear'],
      ['b.branch_name', 'branchName'],
      ['b.branch_code', 'branchCode'],
      ['e.name', 'employeeName'],
      ['e.nik', 'employeeNik'],
    );
    qb.leftJoin((e) => e.branch, 'b');
    qb.leftJoin((e) => e.period, 'p');
    qb.leftJoin((e) => e.employee, 'e');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const loan: LoanDTO[] = await qb.exec();
    return new LoanWithPaginationResponse(loan, params);
  }

  public async getById(id: string) {}
  public async pay(id: string, payload?: any) {}
}
