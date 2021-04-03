/** Entity */
import { DownPayment } from '../../../model/down-payment.entity';
/** Interfaces */
import { ReportDownPaymentDTO } from './report-down-payment.dto';

export class ReportDownPaymentResponseMapper {
  public static toDTO(dto: Partial<ReportDownPaymentDTO>): ReportDownPaymentDTO {
    const dp = new ReportDownPaymentDTO();
    dp.id = dto.id;
    dp.number = dto.number;
    dp.amount = dto.amount;
    dp.totalRealized = dto.totalRealized;
    dp.branchId = dto.branchId;
    dp.branchName = dto.branchName;
    dp.expenseId = dto.expenseId;
    dp.isRealized = dto.isRealized;
    dp.transactionDate = dto.transactionDate;
    return dp;
  }

  public static fromOneEntity(ety: Partial<any>) {
    return this.toDTO({
      id: ety.id,
      number: ety.number,
      amount: ety.amount,
      branchId: ety.branchId,
      branchName: ety.branch.branchName,
      expenseId: ety.expenseId,
      totalRealized: ety.expense.totalAmount,
      isRealized: ety.expenseId ? true : false,
      transactionDate: ety.transactionDate,
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
