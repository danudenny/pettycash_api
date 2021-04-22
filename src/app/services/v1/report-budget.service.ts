import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Console } from 'console';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { BudgetItem } from '../../../model/budget-item.entity';
import { BudgetRequestItem } from '../../../model/budget.request-item.entity';
import { ExpenseItem } from '../../../model/expense-item.entity';
import { QueryReportBudgetDTO } from '../../domain/report-budget/report-budget-query.dto';
import { ReportBudgetsWithPaginationResponse } from '../../domain/report-budget/report-budget-response.dto';
import { ReportBudgetDTO } from '../../domain/report-budget/report-budget.dto';

@Injectable()
export class ReportBudgetService {
  public async getAllReport(
    query?: QueryReportBudgetDTO,
  ): Promise<ReportBudgetsWithPaginationResponse> {
    try {
      const params = { order: '^created_at', limit: 10, ...query };
      const getBudget = await this.getDataBudget(params);
      const getBudgetRequest = await this.getDataBudgetReq(params);
      const getExpense = await this.getDataExpense(params);
      console.log("GET BUDGET !");
      console.log(getBudget);
      console.log("-------------");
      console.log("GET BUDGET REQUEST !");
      console.log(getBudgetRequest);
      console.log("-------------");
      console.log("GET EXPENSE !");
      console.log(getExpense);
      console.log("-------------");

      const resultData = [];
      getBudget.forEach(element => {
        const dataAll = new ReportBudgetDTO;
        dataAll.id = element.id;
        dataAll.number = element.number;
        dataAll.productName = element.productName;
        dataAll.branchName = element.branchName;
        dataAll.responsibleUser = element.firstName + ' ' + element.lastName;
        dataAll.startDate = element.startDate;
        dataAll.endtDate = element.endtDate;

        const totalAmountAll = 0;
        for (let i=0; i < getBudgetRequest.length; i++) {
          if (getBudgetRequest[i].needDate >= element.startDate && getBudgetRequest[i].needDate <= element.endDate) {
            
          }
        }
      });

      return new ReportBudgetsWithPaginationResponse(
        getBudget,
        params,
      );
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getDataBudget(params) {
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

    const budget = await qb.exec();
    return budget;
  }

  public async getDataBudgetReq(params) {
    const qb = new QueryBuilder(BudgetRequestItem, 'bgitemreq', params);

    qb.fieldResolverMap['branchId'] = 'bgtr.branch_id';
    qb.fieldResolverMap['startDate__gte'] = 'bgtr.needDate';
    qb.fieldResolverMap['endDate__lte'] = 'bgtr.needDate';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['bgitemreq.id', 'id'],
      ['bgtr.branch_id', 'branchId'],
      ['br.branch_name', 'branchName'],
      ['bgtr.number', 'number'],
      ['bgtr.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'firstName'],
      ['us.last_name', 'lastName'],
      ['us.employee_id', 'employeeId'],
      ['bgtr.need_date', 'needDate'],
      ['prod.name', 'prodName'],
      ['bgitemreq.amount', 'bgtAmount']
    );
    qb.leftJoin(
      (e) => e.budgetRequest,
      'bgtr'
    );
    qb.leftJoin(
      (e) => e.budgetRequest.branch,
      'br'
    );
    qb.leftJoin(
      (e) => e.budgetRequest.users,
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

    const budgetRequests = await qb.exec();
    return budgetRequests;
  }

  public async getDataExpense(params) {
    const qb = new QueryBuilder(ExpenseItem, 'expitem', params);

    qb.fieldResolverMap['branchId'] = 'bgtr.branch_id';
    qb.fieldResolverMap['startDate__gte'] = 'bgtr.transactionDate';
    qb.fieldResolverMap['endDate__lte'] = 'bgtr.transactionDate';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['expitem.id', 'id'],
      ['exp.branch_id', 'branchId'],
      ['br.branch_name', 'branchName'],
      ['exp.number', 'number'],
      ['exp.transaction_date', 'transactionDate'],
      ['prod.name', 'prodName'],
      ['expitem.amount', 'bgtAmount']
    );
    qb.leftJoin(
      (e) => e.expense,
      'exp'
    );
    qb.leftJoin(
      (e) => e.expense.branch,
      'br'
    );
    qb.leftJoin(
      (e) => e.product,
      'prod'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const budgetRequests = await qb.exec();
    return budgetRequests;
  }
}
