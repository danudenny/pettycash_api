import { LoanDTO } from './loan.dto';

export class LoanResponseMapper {
  private static toDTO(data: LoanDTO): LoanDTO {
    // Custom Transformer
    // QueryBuilder not respecting numeric transformer in Entity :(
    data.amount = +data.amount;
    data.residualAmount = +data.residualAmount;
    data.paidAmount = +data.paidAmount;
    data.downPaymentNumber = data.downPaymentId ? data.sourceDocument : null;
    return data;
  }

  private static toManyDTO(datas: LoanDTO[]) {
    return datas.map((e) => this.toDTO(e));
  }

  public static fromDTO(data: LoanDTO | LoanDTO[]): LoanDTO | LoanDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
