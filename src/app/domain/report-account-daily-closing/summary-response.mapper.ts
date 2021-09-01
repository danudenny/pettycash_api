import { ReportAccountDailyClosingSummaryDTO } from './summary.dto';

export class ReportAccountDailyClosingSummaryResponseMapper {
  public static toDTO(
    datas: ReportAccountDailyClosingSummaryDTO[],
  ): ReportAccountDailyClosingSummaryDTO {
    let data: ReportAccountDailyClosingSummaryDTO;
    if (datas?.length) {
      data = datas[0];
    }
    const it = new ReportAccountDailyClosingSummaryDTO();
    it.openingBankAmount = +data.openingBankAmount;
    it.closingBankAmount = +data.closingBankAmount;
    it.openingCashAmount = +data.openingCashAmount;
    it.closingCashAmount = +data.closingCashAmount;
    it.openingBonAmount = +data.openingBonAmount;
    it.closingBonAmount = +data.closingBonAmount;
    return it;
  }

  public static fromQueryBuilder(
    data: ReportAccountDailyClosingSummaryDTO[],
  ): ReportAccountDailyClosingSummaryDTO {
    return this.toDTO(data);
  }
}
