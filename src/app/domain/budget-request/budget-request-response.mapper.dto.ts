import { BudgetRequestDTO } from './budget-request.dto';
import { BudgetRequest } from '../../../model/budget.request.entity';

export class BudgetRequestResponseMapper {
  public static toDTO(dto: Partial<BudgetRequestDTO>): BudgetRequestDTO {
    const it = new BudgetRequestDTO();
    it.id = dto.id;
    it.branchId = dto.branchId;
    it.branchName = dto.branchName;
    it.budgetId = dto.budgetId;
    it.number = dto.number;
    it.responsibleUserId = dto.responsibleUserId;
    it.responsibleUserFirstName = dto.responsibleUserFirstName;
    it.responsibleUserLastName = dto.responsibleUserLastName;
    it.responsibleUserUsername = dto.responsibleUserUsername;
    it.needDate = dto.needDate;
    it.totalAmount = dto.totalAmount;
    it.state = dto.state;
    it.rejectedNote = dto.rejectedNote;
    return it;
  }

  public static fromOneEntity(ety: Partial<BudgetRequest>) {
    return this.toDTO({
      id: ety.id,
      branchId: ety.branchId,
      branchName: ety.branch && ety.branch.branchName,
      budgetId: ety.budgetId,
      number: ety.number,
      responsibleUserId: ety.responsibleUserId,
      responsibleUserFirstName: ety.users && ety.users.firstName,
      responsibleUserLastName: ety.users && ety.users.lastName,
      responsibleUserUsername: ety.users && ety.users.username,
      needDate: ety.needDate,
      totalAmount: ety.totalAmount,
      state: ety.state,
      rejectedNote: ety.rejectedNote,
    });
  }

  public static fromManyEntity(entities: Partial<BudgetRequest[]>) {
    return entities.map((e) => BudgetRequestResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<BudgetRequestDTO[]>) {
    return entities.map((e) => BudgetRequestResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<BudgetRequestDTO | BudgetRequestDTO[]>,
  ): BudgetRequestDTO | BudgetRequestDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<BudgetRequest | BudgetRequest[]>,
  ): BudgetRequestDTO | BudgetRequestDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
