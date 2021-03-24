import { BudgetHistoryDTO } from './budget-history.dto';
import { MASTER_ROLES } from '../../../model/utils/enum';
import { Branch } from '../../../model/branch.entity';
import { BudgetDetailDTO } from './budget-detail.dto';
import { BudgetItem } from '../../../model/budget-item.entity';
import { BudgetItemDTO } from '../budget-item/budget-item.dto';
import { BudgetHistory } from '../../../model/budget-history.entity';
import { Budget } from '../../../model/budget.entity';

export class BudgetDetailResponseMapper {
  public static toDTO(dto: BudgetDetailDTO): BudgetDetailDTO {
    return dto;
  }

  private static toBudgetItemDTO(datas: BudgetItem[]): BudgetItemDTO[] {
    const items = datas.map((v) => {
      const item = new BudgetItemDTO();
      item.id = v.id;
      item.productId = v.productId;
      item.productName = v.product && v.product.name;
      item.productCode = v.product && v.product.code;
      item.description = v.description;
      item.amount = v.amount;
      return item;
    });

    return items;
  }

  private static toBudgetHistoryDTO(
    datas: BudgetHistory[],
    branch: Branch,
  ): BudgetHistoryDTO[] {
    const histories = datas.map((v) => {
      const h = new BudgetHistoryDTO();
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

  public static fromOneEntity(ety: Partial<Budget>) {
    return this.toDTO({
      id: ety.id,
      branchId: ety.branchId,
      branchName: ety?.branch && ety.branch.branchName,
      number: ety.number,
      responsibleUserId: ety.responsibleUserId,
      responsibleUserFirstName: ety?.users && ety.users.firstName,
      responsibleUserLastName: ety?.users && ety.users.lastName,
      responsibleUserUsername: ety?.users && ety.users.username,
      startDate: ety.startDate,
      endDate: ety.endDate,
      minimumAmount: ety.minimumAmount,
      totalAmount: ety.totalAmount,
      state: ety.state,
      rejectedNote: ety.rejectedNote,
      items: this.toBudgetItemDTO(ety.items),
      histories: this.toBudgetHistoryDTO(ety.histories, ety.branch),
    });
  }

  public static fromEntity(entities: Partial<Budget>): BudgetDetailDTO {
    return this.fromOneEntity(entities);
  }
}
