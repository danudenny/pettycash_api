import { ExpenseDTO, ExpenseRelationDTO } from './expense.dto';
import { Expense } from '../../../model/expense.entity';

export class ExpenseResponseMapper {
  public static toDTO(dto: Partial<ExpenseDTO>): ExpenseDTO {
    const it = new ExpenseDTO();
    it.id = dto.id;
    it.transactionDate = dto.transactionDate;
    it.periodMonth = dto.periodMonth;
    it.periodYear = dto.periodYear;
    it.branchName = dto.branchName;
    it.type = dto.type;
    it.downPaymentId = dto.downPaymentId;
    it.downPaymentNumber = dto.downPaymentNumber;
    it.number = dto.number;
    it.totalAmount = dto.totalAmount;
    it.state = dto.state;
    return it;
  }

  public static fromOneEntity(ety: Partial<Expense>) {
    return this.toDTO({
      id: ety.id,
      transactionDate: ety.transactionDate,
      periodMonth: ety.period && ety.period.month,
      periodYear: ety.period && ety.period.year,
      branchName: ety.branch && ety.branch.branchName,
      type: ety.type,
      downPaymentId: ety.downPaymentId,
      downPaymentNumber: ety?.downPayment?.number,
      number: ety.number,
      totalAmount: ety.totalAmount,
      state: ety.state,
    });
  }

  public static fromManyEntity(entities: Partial<Expense[]>) {
    return entities.map((e) => ExpenseResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<ExpenseDTO[]>) {
    return entities.map((e) => ExpenseResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<ExpenseDTO | ExpenseDTO[]>,
  ): ExpenseDTO | ExpenseDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<Expense | Expense[]>,
  ): ExpenseDTO | ExpenseDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
