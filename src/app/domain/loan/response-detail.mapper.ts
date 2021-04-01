import { Loan } from '../../../model/loan.entity';
import { LoanDetailDTO } from './loan-detail.dto';
import { LoanPaymentDTO } from './loan-payment.dto';

export class LoanDetailResponseMapper {
  private static toDTO(ety: Loan): LoanDetailDTO {
    const dto = new LoanDetailDTO();
    dto.id = ety.id;
    dto.employeeName = ety.employee?.name;
    dto.employeeNik = ety.employee?.nik;
    dto.sourceDocument = ety.sourceDocument;
    dto.amount = ety.amount;
    dto.residualAmount = ety.residualAmount;
    dto.state = ety.state;
    dto.payments = this.toPaymentDTO(ety);
    return dto;
  }

  private static toPaymentDTO(ety: Loan): LoanPaymentDTO[] {
    const { name, nik } = ety?.employee;
    const payments = ety?.payments?.map((v) => {
      const payment = new LoanPaymentDTO();
      payment.id = v.id;
      payment.transactionDate = v.transactionDate;
      payment.amount = v.amount;
      payment.type = v.type;
      payment.paymentMethod = v.paymentMethod;
      payment.receiverName = name;
      payment.receiverNik = nik;
      return payment;
    });
    return payments;
  }

  public static fromEntity(data: Loan): LoanDetailDTO {
    return this.toDTO(data);
  }
}
