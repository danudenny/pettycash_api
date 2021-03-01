import { BudgetItemDTO } from './budget-item.dto';
import { BudgetItem } from '../../../model/budget-item.entity';

export class BudgetItemResponseMapper {
  public static toDTO(dto: Partial<BudgetItemDTO>): BudgetItemDTO {
    const it = new BudgetItemDTO();
    it.id = dto.id;
    it.budgetId = dto.budgetId;
    it.productId = dto.productId;
    it.productName = dto.productName;
    it.description = dto.description;
    it.amount = dto.amount;
    return it;
  }

  public static fromOneEntity(ety: Partial<BudgetItem>) {
    return this.toDTO({
      id: ety.id,
      budgetId: ety.budgetId,
      productId: ety.productId,
      productName: ety.product && ety.product.name,
      description: ety.description,
      amount: ety.amount,
    });
  }

  public static fromManyEntity(entities: Partial<BudgetItem[]>) {
    return entities.map((e) => BudgetItemResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<BudgetItemDTO[]>) {
    return entities.map((e) => BudgetItemResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<BudgetItemDTO | BudgetItemDTO[]>,
  ): BudgetItemDTO | BudgetItemDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<BudgetItem | BudgetItem[]>,
  ): BudgetItemDTO | BudgetItemDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
