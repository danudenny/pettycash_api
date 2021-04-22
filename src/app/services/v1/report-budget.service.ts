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
      //Get data Budget Item all first
      const getBudget = await this.getDataBudget(params);

      //Get data Budget Request Item all second
      const getBudgetRequest = await this.getDataBudgetReq(params);

      //Get data Expense Item all third
      const getExpense = await this.getDataExpense(params);

      const resultData = [];
      //Mapping all Data
      getBudget.forEach(element => {
        const dataAll = new ReportBudgetDTO;
        dataAll.id = element.id;
        dataAll.number = element.number;
        dataAll.productName = element.productName;
        dataAll.branchName = element.branchName;
        dataAll.responsibleUser = element.firstName + ' ' + element.lastName;
        dataAll.startDate = element.startDate;
        dataAll.endtDate = element.endtDate;

        //Find Total Amount Budget by get needDate and productId is equal with Budget Request too
        let totalAmountAll = Number(element.amount);
        for (let i=0; i < getBudgetRequest.length; i++) {
          if (getBudgetRequest[i].needDate >= element.startDate && getBudgetRequest[i].needDate <= element.endDate) {
            if (getBudgetRequest[i].productId === element.productId) {
              totalAmountAll = totalAmountAll + Number(getBudgetRequest[i].amount);
            }
          }
        }

        //Find Total Amount Expense by get needDate and productId is equal
        let totalExpenseAll = 0;
        for (let i=0; i < getExpense.length; i++) {
          if (getExpense[i].transactionDate >= element.startDate && getExpense[i].transactionDate <= element.endDate) {
            if (getExpense[i].productId === element.productId) {
              totalExpenseAll = totalExpenseAll + Number(getExpense[i].amount);
            }
          }
        }

        dataAll.totalAmount = totalAmountAll;
        dataAll.expendseAmount = totalExpenseAll;
        
        resultData.push(dataAll);
      });

      return new ReportBudgetsWithPaginationResponse(
        resultData,
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
      ['bgitem.product_id', 'productId'],
      ['bgt.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'firstName'],
      ['us.last_name', 'lastName'],
      ['us.employee_id', 'employeeId'],
      ['bgt.start_date', 'startDate'],
      ['bgt.end_date', 'endDate'],
      ['prod.name', 'prodName'],
      ['bgitem.amount', 'amount']
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
      ['bgitemreq.product_id', 'productId'],
      ['bgtr.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'firstName'],
      ['us.last_name', 'lastName'],
      ['us.employee_id', 'employeeId'],
      ['bgtr.need_date', 'needDate'],
      ['prod.name', 'prodName'],
      ['bgitemreq.amount', 'amount']
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
      ['expitem.product_id', 'productId'],
      ['exp.transaction_date', 'transactionDate'],
      ['prod.name', 'prodName'],
      ['expitem.amount', 'amount']
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
