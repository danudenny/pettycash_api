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
    dp.amount = dto.amount;
    dp.paymentType = dto.paymentType;
    dp.branchId = dto.branchId;
    dp.branchName = dto.branchName;
    dp.departmentId = dto.departmentId;
    dp.departmentName = dto.departmentName;
    dp.employeeId = dto.employeeId;
    dp.employeeName = dto.employeeName;
    dp.destinationPlace = dto.destinationPlace;
    dp.description = dto.description;
    dp.state = dto.state;
    dp.isRealized = dto.isRealized;
    dp.transactionDate = dto.transactionDate;
    return dp;
  }

  public static fromOneEntity(ety: Partial<DownPayment>) {
    return this.toDTO({
      id: ety.id,
      type: ety.type,
      number: ety.number,
      amount: ety.amount,
      paymentType: ety.paymentType,
      branchId: ety.branchId,
      branchName: ety.branch.branchName,
      departmentId: ety.departmentId,
      departmentName: ety.department.name,
      employeeId: ety.employeeId,
      employeeName: ety.employee.name,
      destinationPlace: ety.destinationPlace,
      description: ety.description,
      state: ety.state,
      isRealized: ety.isRealized,
      transactionDate: ety.transactionDate,
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
