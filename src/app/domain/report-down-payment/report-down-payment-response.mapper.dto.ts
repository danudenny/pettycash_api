/** Interfaces */
import { ReportDownPaymentDTO } from './report-down-payment.dto';

export class ReportDownPaymentResponseMapper {
  public static toDTO(
    dto: Partial<ReportDownPaymentDTO>,
  ): ReportDownPaymentDTO {
    const dp = new ReportDownPaymentDTO();
    dp.id = dto.id;
    dp.numberDownPayment = dto.numberDownPayment;
    dp.branchName = dto.branchName;
    dp.amountDownPayment = +dto.amountDownPayment;
    dp.amountRealized = +dto.amountRealized;
    dp.amountRepayment = +dto.amountRepayment;
    return dp;
  }

  public static toManyDTO(entities: Partial<any[]>) {
    return entities.map((e) => ReportDownPaymentResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<ReportDownPaymentDTO | ReportDownPaymentDTO[]>,
  ): ReportDownPaymentDTO | ReportDownPaymentDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
