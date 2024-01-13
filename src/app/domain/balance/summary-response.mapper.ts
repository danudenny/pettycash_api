import { BalanceSummaryDTO } from './summary-balance.dto';

export class BalanceSummaryResponseMapper {
  public static toDTO(datas: BalanceSummaryDTO[]): BalanceSummaryDTO {
    let data: BalanceSummaryDTO;
    if (datas?.length) {
      data = datas[0];
    }
    const it = new BalanceSummaryDTO();
    it.branchId = data?.branchId ?? null;
    it.branchName = data?.branchName ?? null;
    it.bankAmount = +data?.bankAmount ?? null;
    it.cashAmount = +data?.cashAmount ?? null;
    it.bonAmount = +data?.bonAmount ?? null;
    it.totalAmount = +data?.totalAmount ?? null;
    it.minimumAmount = +data?.minimumAmount ?? null;
    it.retreiveAt = data?.retreiveAt ?? null;
    return it;
  }

  public static fromQueryBuilder(data: BalanceSummaryDTO[]): BalanceSummaryDTO {
    return this.toDTO(data);
  }
}
