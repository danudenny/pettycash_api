/** Entity */
import { DownPayment } from '../../../model/down-payment.entity';
/** Interfaces */
import { ReportDownPaymentDTO } from './report-down-payment.dto';

export class ReportDownPaymentResponseMapper {
  public static toDTO(dto: Partial<ReportDownPaymentDTO>): ReportDownPaymentDTO {
    const dp = new ReportDownPaymentDTO();
    dp.id = dto.id;
    dp.numberDownPayment = dto.numberDownPayment;
    dp.sourceDocument = dto.sourceDocument;
    dp.branchName = dto.branchName;
    dp.amountDownPayment = dto.totalRealized;
    dp.totalRealized = dto.totalRealized;
    dp.amountRepayment = dto.amountRepayment;
    return dp;
  }

  public static fromOneEntity(ety: Partial<any>) {
    return this.toDTO({
      id: ety.id,
      numberDownPayment: ety.numberDownPayment,
      sourceDocument: ety.sourceDocument,
      branchName: ety.branchName,
      amountDownPayment: ety.totalRealized,
      totalRealized: ety.totalRealized,
      amountRepayment: ety.amountRepayment,
    });
  }

  public static fromManyEntity(entities: Partial<any[]>) {
    return entities.map((e) => ReportDownPaymentResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<any[]>) {
    return entities.map((e) => ReportDownPaymentResponseMapper.toDTO(e));
  }

  public static fromDTO(data: Partial<ReportDownPaymentDTO | ReportDownPaymentDTO[]>,): ReportDownPaymentDTO | ReportDownPaymentDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(  entities: Partial<object | []>,): ReportDownPaymentDTO | ReportDownPaymentDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
