import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { AccountStatement } from '../../../model/account-statement.entity';
import {
  AccountStatementAmountPosition,
  AccountStatementType,
} from '../../../model/utils/enum';
import { QueryAccountStatementDTO } from '../../domain/account-statement/account-statement.payload.dto';
import { CreateAccountStatementDTO } from '../../domain/account-statement/create.dto';
import { AccountStatementWithPaginationResponse } from '../../domain/account-statement/response.dto';
import { AuthService } from './auth.service';

@Injectable()
export class AccountStatementService {
  constructor(
    @InjectRepository(AccountStatement)
    private readonly repo: Repository<AccountStatement>,
  ) {}

  public async create(payload: CreateAccountStatementDTO): Promise<any> {
    const { amount, type, transactionDate } = payload;
    const reference = GenerateCode.accountStatement(transactionDate);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranch = user?.branches[0];

    let typeDebit: AccountStatementType;
    let typeCredit: AccountStatementType;

    // type `BANK`: Transfer from Bank to Cash
    if (type === AccountStatementType.BANK) {
      typeDebit = AccountStatementType.BANK;
      typeCredit = AccountStatementType.CASH;
      // type `CASH`: Transfer from Cash to Bank
    } else if (type === AccountStatementType.CASH) {
      typeDebit = AccountStatementType.CASH;
      typeCredit = AccountStatementType.BANK;
    } else {
      throw new BadRequestException(`Transaction Type is required!`);
    }

    const statementDebit = new AccountStatement();
    statementDebit.reference = reference;
    statementDebit.amount = amount;
    statementDebit.transactionDate = transactionDate;
    statementDebit.branch = userBranch;
    statementDebit.type = typeDebit;
    statementDebit.amountPosition = AccountStatementAmountPosition.DEBIT;
    statementDebit.createUser = user;
    statementDebit.updateUser = user;

    const statementCredit = new AccountStatement();
    statementCredit.reference = reference;
    statementCredit.amount = amount;
    statementCredit.transactionDate = transactionDate;
    statementCredit.branch = userBranch;
    statementCredit.type = typeCredit;
    statementCredit.amountPosition = AccountStatementAmountPosition.CREDIT;
    statementCredit.createUser = user;
    statementCredit.updateUser = user;

    await this.repo.save([statementDebit, statementCredit]);
    return;
  }

  public async list(query?: QueryAccountStatementDTO): Promise<AccountStatementWithPaginationResponse> {
    const params = { order: '-transactionDate', ...query };
    const qb = new QueryBuilder(AccountStatement, 'stmt', params);
    const user = await AuthService.getUser({ relations: ['branches'] });
    const userBranches = user?.branches?.map((v) => v.id);

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
    if (userBranches?.length) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranches),
      );
    }

    const statements = await qb.exec();
    return new AccountStatementWithPaginationResponse(statements, params);
  }
}
