import { ExpenseRelationDTO } from './expense.dto';
import { Expense } from '../../../model/expense.entity';

export class ExpenseRelationalResponseMapper {
  public static toRelationalDTO(dto: Partial<ExpenseRelationDTO>) {
    const it = new ExpenseRelationDTO();
    it.id = dto.id;
    it.transactionDate = dto.transactionDate;
    it.periodId = dto.periodId;
    it.type = dto.type;
    it.number = dto.number;
    it.totalAmount = dto.totalAmount;
    it.state = dto.state;
    it.items = dto.items;
    return it;
  }

  public static fromOneRelationalEntity(ety: Partial<Expense>) {
    return this.toRelationalDTO({
      id: ety.id,
      transactionDate: ety.transactionDate,
      periodId: ety.periodId,
      type: ety.type,
      number: ety.number,
      totalAmount: ety.totalAmount,
      state: ety.state,
    });
  }

  public static fromManyRelationalEntity(entities: Partial<Expense[]>) {
    return entities.map((e) => ExpenseRelationalResponseMapper.fromOneRelationalEntity(e));
  }

  public static toManyRelationalDTO(entities: Partial<ExpenseRelationDTO[]>) {
    return entities.map((e) => ExpenseRelationalResponseMapper.toRelationalDTO(e));
  }

  public static fromRelationalDTO(
    data: Partial<ExpenseRelationDTO | ExpenseRelationDTO[]>,
  ): ExpenseRelationDTO | ExpenseRelationDTO[] {
    if (!Array.isArray(data)) {
      return this.toRelationalDTO(data);
    } else {
      return this.toManyRelationalDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<Expense | Expense[]>,
  ): ExpenseRelationDTO | ExpenseRelationDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneRelationalEntity(entities);
    } else {
      return this.fromManyRelationalEntity(entities);
    }
  }
}
