import { BudgetRequestHistoryDTO } from './budget-request-history.dto';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { Branch } from '../../../model/branch.entity';
import { BudgetRequestDetailDTO } from './budget-request-detail.dto';
import { BudgetRequestItemDTO } from '../budget-request-item/budget-request-item.dto';
import { BudgetRequestItem } from '../../../model/budget.request-item.entity';
import { BudgetRequestHistory } from '../../../model/budget.request-history.entity';
import { BudgetRequest } from '../../../model/budget.request.entity';

export class BudgetRequestDetailResponseMapper {
  public static toDTO(dto: BudgetRequestDetailDTO): BudgetRequestDetailDTO {
    return dto;
  }

  private static toBudgetRequestItemDTO(datas: BudgetRequestItem[]): BudgetRequestItemDTO[] {
    const items = datas.map((v) => {
      const item = new BudgetRequestItemDTO();
      item.id = v.id;
      item.productId = v.productId;
      item.productName = v.product && v.product.name;
      item.productCode = v.product && v.product.code;
      item.description = v.description;
      item.amount = v.amount;
      item.isDeleted = v.isDeleted;
      return item;
    });

    return items;
  }

  private static toBudgetRequestHistoryDTO(
    datas: BudgetRequestHistory[],
    branch: Branch,
  ): BudgetRequestHistoryDTO[] {
    const histories = datas.map((v) => {
      const h = new BudgetRequestHistoryDTO();
      h.id = v.id;
      h.userId = v.createUserId;
      h.userFullName = `${v.createUser?.firstName} ${v.createUser?.lastName}`;
      h.userRole =
        v.createUser &&
        v.createUser.role &&
        (v.createUser.role.name as MASTER_ROLES);
      // Based on discussion, Use Budget Branch.
      h.branchName = branch && branch.branchName;
      h.state = v.state;
      h.rejectedNote = v.rejectedNote;
      h.createdAt = v.createdAt;
      return h;
    });
    return histories;
  }

  public static fromOneEntity(ety: Partial<BudgetRequest>) {
    return this.toDTO({
      id: ety.id,
      branchId: ety.branchId,
      budgetId: ety.budgetId,
      branchName: ety?.branch && ety.branch.branchName,
      number: ety.number,
      responsibleUserId: ety.responsibleUserId,
      responsibleUserFirstName: ety?.users && ety.users.firstName,
      responsibleUserLastName: ety?.users && ety.users.lastName,
      responsibleUserUsername: ety?.users && ety.users.username,
      needDate: ety.needDate,
      totalAmount: ety.totalAmount,
      state: ety.state,
      rejectedNote: ety.rejectedNote,
      items: this.toBudgetRequestItemDTO(ety.items),
      histories: this.toBudgetRequestHistoryDTO(ety.histories, ety.branch),
    });
  }

  public static fromEntity(entities: Partial<BudgetRequest>): BudgetRequestDetailDTO {
    return this.fromOneEntity(entities);
  }
}
