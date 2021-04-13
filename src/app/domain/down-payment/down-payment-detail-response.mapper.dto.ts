import { MASTER_ROLES } from '../../../model/utils/enum';
/** Entity */
import { Branch } from '../../../model/branch.entity';
import { DownPayment } from '../../../model/down-payment.entity';
import { DownPaymentHistory } from '../../../model/down-payment-history.entity';
/** Interfaces */
import { DownPaymentHistoryDTO } from './down-payment-history.dto';
import { ShowDownPaymentDTO } from './down-payment.dto';

export class ShowDownPaymentResponseMapper {
  public static toDTO(dto: ShowDownPaymentDTO): ShowDownPaymentDTO {
    return dto;
  }

  private static toDownPaymenteHistoryDTO(
    datas: DownPaymentHistory[],
    branch: Branch,
  ): DownPaymentHistoryDTO[] {
    const histories = datas.map((v) => {
      const h = new DownPaymentHistoryDTO();
      h.id = v.id;
      h.userId = v.createUserId;
      h.state = v.state;
      h.userFullName = `${v.createUser?.firstName} ${v.createUser?.lastName}`;
      h.userRole =
        v.createUser &&
        v.createUser.role &&
        (v.createUser.role.name as MASTER_ROLES);
      // Based on discussion, Use Expense Branch.
      h.branchName = branch && branch.branchName;
      h.rejectedNote = v.rejectedNote;
      h.createdAt = v.createdAt;
      return h;
    });
    return histories;
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
      periodId: ety.periodId,
      destinationPlace: ety.destinationPlace,
      description: ety.description,
      state: ety.state,
      isRealized: ety.expenseId ? true : false,
      transactionDate: ety.transactionDate,
      histories: this.toDownPaymenteHistoryDTO(ety.histories, ety.branch),
    });
  }

  public static fromEntity(entities: Partial<DownPayment>): ShowDownPaymentDTO {
    return this.fromOneEntity(entities);
  }
}
