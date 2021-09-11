/** Entity */
import { DownPayment } from '../../../model/down-payment.entity';
/** Interfaces */
import { DownPaymentDTO } from './down-payment.dto';

export class DownPaymentResponseMapper {
  public static toDTO(dto: Partial<DownPaymentDTO>): DownPaymentDTO {
    const dp = new DownPaymentDTO();
    dp.id = dto.id;
    dp.type = dto.type;
    dp.number = dto.number;
    dp.amount = +dto.amount;
    dp.paymentType = dto.paymentType;
    dp.branchId = dto.branchId;
    dp.branchName = dto.branchName;
    dp.departmentId = dto.departmentId;
    dp.departmentName = dto.departmentName;
    dp.departmentIsActive = dto.departmentIsActive;
    dp.employeeId = dto.employeeId;
    dp.employeeName = dto.employeeName;
    dp.employeeNik = dto.employeeNik;
    dp.periodId = dto.periodId;
    dp.periodName = dto.periodName;
    dp.productId = dto.productId;
    dp.productName = dto.productName;
    dp.destinationPlace = dto.destinationPlace;
    dp.description = dto.description;
    dp.state = dto.state;
    (dp.isRealized = dto.expenseId ? true : false),
      (dp.transactionDate = dto.transactionDate);
    dp.loanId = dto.loanId;
    dp.loanNumber = dto.loanNumber;
    dp.loanType = dto.loanType;
    dp.loanPaidAmount = +dto.loanPaidAmount;
    dp.loanResidualAmount = +dto.loanResidualAmount;
    dp.loanState = dto.loanState;
    return dp;
  }

  public static fromOneEntity(ety: Partial<DownPayment>) {
    return this.toDTO({
      id: ety.id,
      type: ety.type,
      number: ety.number,
      amount: +ety.amount,
      paymentType: ety.paymentType,
      branchId: ety.branchId,
      branchName: ety.branch.branchName,
      departmentId: ety.departmentId,
      departmentName: ety.department.name,
      employeeId: ety.employeeId,
      employeeName: ety.employee.name,
      employeeNik: ety.employee.nik,
      periodId: ety.periodId,
      periodName: ety.period.name,
      productId: ety.productId,
      productName: ety.product?.name || null,
      destinationPlace: ety.destinationPlace,
      description: ety.description,
      state: ety.state,
      isRealized: ety.expenseId ? true : false,
      transactionDate: ety.transactionDate,
      loanId: ety.loanId,
      loanNumber: ety.loan?.number || null,
      loanType: ety.loan?.type || null,
      loanPaidAmount: +ety.loan?.paidAmount || null,
      loanResidualAmount: +ety.loan?.residualAmount || null,
      loanState: ety.loan?.state || null,
    });
  }

  public static fromManyEntity(entities: Partial<DownPayment[]>) {
    return entities.map((e) => DownPaymentResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<DownPaymentDTO[]>) {
    return entities.map((e) => DownPaymentResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<DownPaymentDTO | DownPaymentDTO[]>,
  ): DownPaymentDTO | DownPaymentDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<DownPayment | DownPayment[]>,
  ): DownPaymentDTO | DownPaymentDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
