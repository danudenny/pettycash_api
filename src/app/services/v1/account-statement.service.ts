import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { AccountStatement } from '../../../model/account-statement.entity';
import {
  AccountStatementAmountPosition,
  AccountStatementMutationType,
  AccountStatementSourceType,
  AccountStatementType,
} from '../../../model/utils/enum';
import { parseBool } from '../../../shared/utils';
import { QueryAccountStatementDTO } from '../../domain/account-statement/account-statement.payload.dto';
import { CreateAccountStatementDTO } from '../../domain/account-statement/create.dto';
import { AccountStatementWithPaginationResponse } from '../../domain/account-statement/response.dto';
import { AuthService } from './auth.service';
import { BalanceService } from './balance.service';

@Injectable()
export class AccountStatementService {
  constructor(
    @InjectRepository(AccountStatement)
    private readonly repo: Repository<AccountStatement>,
  ) {}

  public async create(payload: CreateAccountStatementDTO): Promise<any> {
    const { amount, type, transactionDate, description } = payload;
    const reference = GenerateCode.accountStatement(transactionDate);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranch = user?.branches[0];

    const {
      BANK_TO_CASH,
      BANK_TO_BON,
      CASH_TO_BANK,
      CASH_TO_BON,
      BON_TO_CASH,
      BON_TO_BANK,
    } = AccountStatementMutationType;
    const { BANK, CASH, BON } = AccountStatementType;

    let typeDebit: AccountStatementType;
    let typeCredit: AccountStatementType;

    if (type === BANK_TO_CASH) {
      typeDebit = BANK;
      typeCredit = CASH;
    } else if (type === BANK_TO_BON) {
      typeDebit = BANK;
      typeCredit = BON;
    } else if (type === CASH_TO_BANK) {
      typeDebit = CASH;
      typeCredit = BANK;
    } else if (type === CASH_TO_BON) {
      typeDebit = CASH;
      typeCredit = BON;
    } else if (type === BON_TO_CASH) {
      typeDebit = BON;
      typeCredit = CASH;
    } else if (type === BON_TO_BANK) {
      typeDebit = BON;
      typeCredit = BANK;
    } else {
      throw new BadRequestException(`Transaction Type is required!`);
    }

    const statementDebit = new AccountStatement();
    statementDebit.reference = reference;
    statementDebit.description = description;
    statementDebit.amount = amount;
    statementDebit.transactionDate = transactionDate;
    statementDebit.branch = userBranch;
    statementDebit.type = typeDebit;
    statementDebit.amountPosition = AccountStatementAmountPosition.DEBIT;
    statementDebit.createUser = user;
    statementDebit.updateUser = user;

    const statementCredit = new AccountStatement();
    statementCredit.reference = reference;
    statementCredit.description = description;
    statementCredit.amount = amount;
    statementCredit.transactionDate = transactionDate;
    statementCredit.branch = userBranch;
    statementCredit.type = typeCredit;
    statementCredit.amountPosition = AccountStatementAmountPosition.CREDIT;
    statementCredit.createUser = user;
    statementCredit.updateUser = user;

    await this.repo.save([statementDebit, statementCredit]);
    // remove cache Balance Summary after create statement
    await BalanceService.invalidateCache(userBranch?.id);
    return;
  }

  public async list(
    query?: QueryAccountStatementDTO,
  ): Promise<AccountStatementWithPaginationResponse> {
    const params = { order: '-transactionDate', ...query };
    const qb = new QueryBuilder(AccountStatement, 'stmt', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['startDate__gte'] = 'stmt.transaction_date';
    qb.fieldResolverMap['endDate__lte'] = 'stmt.transaction_date';
    qb.fieldResolverMap['branchId'] = 'brnc.id';
    qb.fieldResolverMap['type'] = 'stmt."type"';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['stmt.id', 'id'],
      ['stmt.transaction_date', 'transactionDate'],
      ['stmt."type"', 'type'],
      ['stmt.reference', 'reference'],
      ['stmt.description', 'description'],
      ['stmt.source_type', 'sourceType'],
      ['stmt.amount', 'amount'],
      ['stmt.amount_position', 'amountPosition'],
      ['brnc.id', 'branchId'],
      ['brnc.branch_name', 'branchName'],
      ['brnc.branch_code', 'branchCode'],
      ['user.username', 'userNik'],
      ['user.first_name', 'userFirstName'],
      ['user.last_name', 'userLastName'],
    );
    qb.leftJoin((e) => e.branch, 'brnc');
    qb.leftJoin((e) => e.updateUser, 'user');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.qb.addOrderBy('stmt.updated_at', 'DESC');
    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranchIds),
      );
    }
    if (parseBool(query?.isDownPayment)) {
      qb.andWhere(
        (e) => e.sourceType,
        (v) => v.equals(AccountStatementSourceType.DP),
      );
    }

    const statements = await qb.exec();
    return new AccountStatementWithPaginationResponse(statements, params);
  }
}
