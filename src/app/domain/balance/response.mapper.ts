import { BalanceDTO } from './balance.dto';

export class BalanceResponseMapper {
  public static toDTO(data: any): BalanceDTO {
    const it = new BalanceDTO();
    it.branchId = data.branch_id;
    it.branchName = data.branch_id;
    it.currentAmount = +data.current_balance;
    it.minimumAmount = +data.minimum_amount;
    it.budgetAmount = +data.budget_amount;
    it.differenceAmount = +data.difference_amount;
    it.state = data.state;
    return it;
  }

  public static toManyDTO(datas: any[]) {
    return datas.map((data) => BalanceResponseMapper.toDTO(data));
  }

  public static fromQueryBuilder(data: any[]): BalanceDTO[] {
    return this.toManyDTO(data);
  }
}
