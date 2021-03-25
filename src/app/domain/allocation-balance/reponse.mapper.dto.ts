import { AllocationBalanceDTO } from './allocation-balance.dto';
import { CashBalanceAllocation } from '../../../model/cash.balance.allocation.entity';

export class AllocationBalanceResponseMapper {
  public static toDTO(data: any): AllocationBalanceDTO {
    const it = new AllocationBalanceDTO();
    it.branchId = data.branch_id;
    it.branchName = data.branch_id;
    it.number = data.number;
    it.amount = data.amount;
    it.responsibleUserId = data.responsibleUserId;
    it.picName = data.picName;
    it.nik = data.nik;
    it.state = data.state;
    it.receivedDate = data.receivedDate;
    it.receivedUserId = data.receivedUserId;
    it.receivedUserName = data.receivedUserName;
    return it;
  }

  public static fromOneEntity(ety: Partial<CashBalanceAllocation>) {
    return this.toDTO({
      id: ety.id,
      branchId: ety.branchId,
      branchName: ety.branch && ety.branch.branchName,
      number: ety.number,
      amount: ety.amount,
      responsibleUserId: ety.responsibleUserId,
      picName: ety.responsibleUser && ety.responsibleUser.firstName,
      nik: ety.responsibleUser && ety.responsibleUser.username,
      state: ety.state,
      receivedDate: ety.receivedDate,
      receivedUserId: ety.receivedUserId,
      receivedUserName: ety.receivedUser && ety.receivedUser.firstName,
    });
  }


  public static fromManyEntity(entities: Partial<CashBalanceAllocation[]>) {
    return entities.map((e) => AllocationBalanceResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<AllocationBalanceDTO[]>) {
    return entities.map((e) => AllocationBalanceResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<AllocationBalanceDTO | AllocationBalanceDTO[]>,
  ): AllocationBalanceDTO | AllocationBalanceDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<CashBalanceAllocation | CashBalanceAllocation[]>,
  ): AllocationBalanceDTO | AllocationBalanceDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
