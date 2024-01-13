import { BudgetDTO } from './budget.dto';
import { Budget } from '../../../model/budget.entity';

export class BudgetResponseMapper {
  public static toDTO(dto: Partial<BudgetDTO>): BudgetDTO {
    const it = new BudgetDTO();
    it.id = dto.id;
    it.branchId = dto.branchId;
    it.branchName = dto.branchName;
    it.branchCode = dto.branchCode;
    it.number = dto.number;
    it.responsibleUserId = dto.responsibleUserId;
    it.responsibleUserFirstName = dto.responsibleUserFirstName;
    it.responsibleUserLastName = dto.responsibleUserLastName;
    it.responsibleUserUsername = dto.responsibleUserUsername;
    it.startDate = dto.startDate;
    it.endDate = dto.endDate;
    it.minimumAmount = dto.minimumAmount;
    it.totalAmount = dto.totalAmount;
    it.state = dto.state;
    it.rejectedNote = dto.rejectedNote;
    return it;
  }

  public static fromOneEntity(ety: Partial<Budget>) {
    return this.toDTO({
      id: ety.id,
      branchId: ety.branchId,
      branchName: ety.branch && ety.branch.branchName,
      number: ety.number,
      responsibleUserId: ety.responsibleUserId,
      responsibleUserFirstName: ety.users && ety.users.firstName,
      responsibleUserLastName: ety.users && ety.users.lastName,
      responsibleUserUsername: ety.users && ety.users.username,
      startDate: ety.startDate,
      endDate: ety.endDate,
      minimumAmount: ety.minimumAmount,
      totalAmount: ety.totalAmount,
      state: ety.state,
      rejectedNote: ety.rejectedNote,
    });
  }

  public static fromManyEntity(entities: Partial<Budget[]>) {
    return entities.map((e) => BudgetResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<BudgetDTO[]>) {
    return entities.map((e) => BudgetResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<BudgetDTO | BudgetDTO[]>,
  ): BudgetDTO | BudgetDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<Budget | Budget[]>,
  ): BudgetDTO | BudgetDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
