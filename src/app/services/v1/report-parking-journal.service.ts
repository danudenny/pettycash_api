import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { JournalItem } from '../../../model/journal-item.entity';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { QueryReportParkingJournalDTO } from '../../domain/report-parking-journal/query.dto';
import { ReportParkingJournalWithPaginationResponse } from '../../domain/report-parking-journal/response.dto';
import { AuthService } from './auth.service';

@Injectable()
export class ReportParkingJournalService {
  public async list(query?: QueryReportParkingJournalDTO) {
    const { userRoleName } = await AuthService.getUserBranchAndRole();
    const ALLOWED_ROLES = [MASTER_ROLES.SUPERUSER, MASTER_ROLES.ACCOUNTING];

    if (!ALLOWED_ROLES.includes(userRoleName)) {
      throw new UnprocessableEntityException(
        `Role ${userRoleName} not allowed to access this menu!`,
      );
    }

    const params = { order: '-transactionDate', ...query };
    const qb = new QueryBuilder(JournalItem, 'ji', params);

    qb.fieldResolverMap['startDate__gte'] = 'ji.transaction_date';
    qb.fieldResolverMap['endDate__lte'] = 'ji.transaction_date';
    qb.fieldResolverMap['branchId'] = 'ji.branch_id';
    qb.fieldResolverMap['number__icontains'] = 'j."number"';
    qb.fieldResolverMap['reference__icontains'] = 'j.reference';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['ji.id', 'id'],
      ['ji.transaction_date', 'transactionDate'],
      ['j.created_at', 'createdAt'],
      ['j."number"', 'number'],
      ['j.reference', 'reference'],
      ['c.code', 'coaCode'],
      ['p."name"', 'productName'],
      ['b."branch_name"', 'branchName'],
      ['ji.debit', 'debit'],
      ['ji.credit', 'credit'],
      ['j.source_type', 'origin'],
      ['null', 'destination'],
      [
        `CASE WHEN e.id IS NOT NULL THEN ji.partner_code ELSE NULL END`,
        'employeeNik',
      ],
      [
        `CASE WHEN e.id IS NOT NULL THEN ji.partner_name ELSE NULL END`,
        'employeeName',
      ],
      ['e.position_name', 'employeePositionName'],
      [
        `CASE WHEN e.id IS NULL THEN ji.partner_name ELSE NULL END`,
        'partnerName',
      ],
      ['ji.description', 'description'],
      ['ji.is_ledger', 'isLedger'],
      [`CONCAT(u.first_name, ' ', u.last_name)`, 'createUserFullName'],
      [`NULLIF(exp.source_document, '')`, 'nota'],
    );
    qb.leftJoin((e) => e.journal, 'j');
    qb.leftJoin((e) => e.coa, 'c');
    qb.leftJoin((e) => e.product, 'p');
    qb.leftJoin((e) => e.branch, 'b');
    qb.leftJoin((e) => e.createUser, 'u');
    qb.qb.leftJoin('employee', 'e', 'e.nik = ji.partner_code');
    qb.qb.leftJoin('expense', 'exp', 'exp."number" = ji.reference');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.isLedger,
      (v) => v.isTrue(),
    );

    const results = await qb.exec();
    return new ReportParkingJournalWithPaginationResponse(results, params);
  }

  public async export(query?: any) {
    // TODO: add export flow.
  }
}
