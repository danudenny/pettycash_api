import { MASTER_ROLES } from '../../../../model/utils/enum';
import { Branch } from '../../../../model/branch.entity';
import { AllocationBalanceDetailDTO } from '../dto/allocation-balance.dto';
import { CashBalanceAllocation } from '../../../../model/cash.balance.allocation.entity';
import { AlocationBalanceHistoryDTO } from '../dto/allocation-balance-history.dto';
import { CashBalanceAllocationHistory } from '../../../../model/cash.balance.allocation-history.entity';

export class AllocationDetailResponseMapper {
  public static toDTO(dto: AllocationBalanceDetailDTO): AllocationBalanceDetailDTO {
    return dto;
  }

  public static fromOneEntity(ety: Partial<CashBalanceAllocation>) {
    return this.toDTO({
      id: ety.id,
      number: ety.number,
      amount: ety.amount,
      createdAt: ety.createdAt,
      branchId: ety.branchId,
      branchName: ety.branch && ety.branch.branchName,
      transferDate: ety.transferDate,
      state: ety.state,
      responsibleUserId: ety.responsibleUserId,
      picName: ety.responsibleUser && `${ety.responsibleUser?.firstName} ${ety?.responsibleUser?.lastName || ''}`,
      nik: ety.responsibleUser.username,
      receivedUserId: ety.receivedUserId,
      receivedUserName: ety.receivedUser && `${ety.receivedUser?.firstName} ${ety.receivedUser?.lastName || ''}`,
      cashflowTypeId: ety.cashflowType && ety.cashflowType.id,
      cashflowTypeName: ety.cashflowType && ety.cashflowType.name,
      description: ety.description,
      receivedDate: ety.receivedDate,
      destinationBankId: ety.destinationBankId,
      bankName: ety.destinationBank && ety.destinationBank.bankName,
      accountNumber: ety.destinationBank && ety.destinationBank.accountNumber,
      isPaid: ety.isPaid,
      histories: this.toCashBalanceAllocationHistoryDTO(ety.allocationHistory, ety.branch),
    });
  }

  public static fromEntity(entities: Partial<CashBalanceAllocation>): AllocationBalanceDetailDTO {
    return this.fromOneEntity(entities);
  }

  private static toCashBalanceAllocationHistoryDTO(
    data: CashBalanceAllocationHistory[],
    branch: Branch,
  ): AlocationBalanceHistoryDTO[] {
    return data.map((v) => {
      const h = new AlocationBalanceHistoryDTO();
      h.id = v.id;
      h.userId = v.createUserId;
      h.userFullName = `${v.createUser?.firstName} ${v.createUser?.lastName || ''}`;
      h.userRole =
        v.createUser &&
        v.createUser.role &&
        (v.createUser.role.name as MASTER_ROLES);
      // Based on discussion, Use Expense Branch.
      h.branchName = branch && branch.branchName;
      h.state = v.state;
      h.rejectedNote = v.rejectedNote;
      h.createdAt = v.createdAt;
      return h;
    });
  }
}
