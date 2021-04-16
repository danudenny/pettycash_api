import { Expense } from '../../../model/expense.entity';
import { ExpenseItemDTO } from './expense-item.dto';
import { ExpenseItem } from '../../../model/expense-item.entity';
import { ExpenseHistory } from '../../../model/expense-history.entity';
import { ExpenseHistoryDTO } from './expense-history.dto';
import { ExpenseItemAttribute } from '../../../model/expense-item-attribute.entity';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { Branch } from '../../../model/branch.entity';
import { ExpenseDetailDTO } from './expense-detail.dto';
import { ExpenseItemAttributeDTO } from './expense-item-attribute.dto';

export class ExpenseDetailResponseMapper {
  public static toDTO(dto: ExpenseDetailDTO): ExpenseDetailDTO {
    return dto;
  }

  private static toExpenseItemAttributeDTO(
    datas: ExpenseItemAttribute[],
  ): ExpenseItemAttributeDTO[] {
    const attrs = datas.map((v) => {
      const attr = new ExpenseItemAttributeDTO();
      attr.key = v.key;
      attr.value = v.value;
      return attr;
    });
    return attrs;
  }

  private static toExpenseItemDTO(datas: ExpenseItem[]): ExpenseItemDTO[] {
    const items = datas.map((v) => {
      const item = new ExpenseItemDTO();
      item.id = v.id;
      item.productId = v.productId;
      item.productName = v.product && v.product.name;
      item.productCode = v.product && v.product.code;
      item.description = v.description;
      item.amount = v.amount;
      item.picHoAmount = v.picHoAmount;
      item.ssHoAmount = v.ssHoAmount;
      item.checkedNote = v.checkedNote;
      item.isValid = v.isValid;
      item.atrributes = this.toExpenseItemAttributeDTO(v.attributes);
      return item;
    });

    return items;
  }

  private static toExpenseHistoryDTO(
    datas: ExpenseHistory[],
    branch: Branch,
  ): ExpenseHistoryDTO[] {
    const histories = datas.map((v) => {
      const h = new ExpenseHistoryDTO();
      h.id = v.id;
      h.userId = v.createUserId;
      h.userFullName = `${v.createUser?.firstName} ${v.createUser?.lastName}`;
      h.userRole = v?.createUser?.role?.name as MASTER_ROLES;
      // Based on discussion, Use Expense Branch.
      h.branchName = branch && branch.branchName;
      h.state = v.state;
      h.rejectedNote = v.rejectedNote;
      h.createdAt = v.createdAt;
      return h;
    });
    return histories;
  }

  public static fromOneEntity(ety: Partial<Expense>) {
    return this.toDTO({
      id: ety.id,
      transactionDate: ety.transactionDate,
      periodId: ety.periodId,
      periodMonth: ety?.period && ety.period.month,
      periodYear: ety.period && ety.period.year,
      number: ety.number,
      partnerId: ety.partnerId,
      partnerName: ety.partner && ety.partner.name,
      sourceDocument: ety.sourceDocument,
      totalAmount: ety.totalAmount,
      downPaymentAmount: ety.downPaymentAmount,
      differenceAmount: ety.differenceAmount,
      downPaymentId: ety.downPaymentId,
      downPaymentNumber: ety?.downPayment?.number,
      type: ety.type,
      paymentType: ety.paymentType,
      state: ety.state,
      items: this.toExpenseItemDTO(ety.items),
      histories: this.toExpenseHistoryDTO(ety.histories, ety.branch),
    });
  }

  public static fromEntity(entities: Partial<Expense>): ExpenseDetailDTO {
    return this.fromOneEntity(entities);
  }
}
