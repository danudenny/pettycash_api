import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { BudgetItem } from '../../../model/budget-item.entity';
import { QueryReportBudgetDTO } from '../../domain/report-budget/report-budget-query.dto';
import { ReportBudgetsWithPaginationResponse } from '../../domain/report-budget/report-budget-response.dto';

@Injectable()
export class ReportBudgetService {
  public async getAllReport(
    query?: QueryReportBudgetDTO,
  ): Promise<ReportBudgetsWithPaginationResponse> {
    try {
      const params = { order: '^created_at', limit: 10, ...query };

      const qb = new QueryBuilder(BudgetItem, 'bgitem', params);

      qb.fieldResolverMap['branchId'] = 'bgt.branch_id';
      qb.fieldResolverMap['startDate__gte'] = 'bgt.startDate';
      qb.fieldResolverMap['endDate__lte'] = 'bgt.endDate';

      qb.applyFilterPagination();
      qb.selectRaw(
        ['bgitem.id', 'id'],
        ['bgt.branch_id', 'branchId'],
        ['br.branch_name', 'branchName'],
        ['bgt.number', 'number'],
        ['bgt.responsible_user_id', 'responsibleUserId'],
        ['us.first_name', 'firstName'],
        ['us.last_name', 'lastName'],
        ['us.employee_id', 'employeeId'],
        ['bgt.start_date', 'startDate'],
        ['bgt.end_date', 'endDate'],
        ['prod.name', 'prodName'],
        ['bgitem.amount', 'bgtAmount']
      );
      qb.leftJoin(
        (e) => e.budget,
        'bgt'
      );
      qb.leftJoin(
        (e) => e.budget.branch,
        'br'
      );
      qb.leftJoin(
        (e) => e.budget.users,
        'us'
      );
      qb.leftJoin(
        (e) => e.product,
        'prod'
      );
      qb.andWhere(
        (e) => e.isDeleted,
        (v) => v.isFalse(),
      );

      const reportBudget = await qb.exec();

      return new ReportBudgetsWithPaginationResponse(
        reportBudget,
        params,
      );
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
