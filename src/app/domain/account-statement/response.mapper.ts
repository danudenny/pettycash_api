import { AccountStatementDTO } from './account-statement.dto';

export class AccountStatementResponseMapper {
  public static toDTO(data: any): AccountStatementDTO {
    const it = new AccountStatementDTO();
    it.id = data.id;
    it.transactionDate = data.transactionDate;
    it.type = data.type;
    it.reference = data.reference;
    it.amount = +data.amount;
    it.amountPosition = data.amountPosition;
    it.branchId = data.branchId;
    it.branchName = data.branchName;
    it.branchCode = data.branchCode;
    it.updateUserNik = data.userNik;
    it.updateUserFirstName = data.userFirstName;
    it.updateUserLastName = data.userLastName;
    return it;
  }

  public static toManyDTO(datas: any[]) {
    return datas.map((data) => AccountStatementResponseMapper.toDTO(data));
  }

  public static fromQueryBuilder(data: any[]): AccountStatementDTO[] {
    return this.toManyDTO(data);
  }
}
