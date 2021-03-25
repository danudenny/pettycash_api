import { BudgetRequestItemDTO } from './budget-request-item.dto';
import { BudgetRequestItem } from '../../../model/budget.request-item.entity';

export class BudgetRequestItemResponseMapper {
  public static toDTO(dto: Partial<BudgetRequestItemDTO>): BudgetRequestItemDTO {
    const it = new BudgetRequestItemDTO();
    it.id = dto.id;
    it.budgetRequestId = dto.budgetRequestId;
    it.productId = dto.productId;
    it.productName = dto.productName;
    it.description = dto.description;
    it.amount = dto.amount;
    return it;
  }

  public static fromOneEntity(ety: Partial<BudgetRequestItem>) {
    return this.toDTO({
      id: ety.id,
      budgetRequestId: ety.budgetRequestId,
      productId: ety.productId,
      productName: ety.product && ety.product.name,
      description: ety.description,
      amount: ety.amount,
    });
  }

  public static fromManyEntity(entities: Partial<BudgetRequestItem[]>) {
    return entities.map((e) => BudgetRequestItemResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<BudgetRequestItemDTO[]>) {
    return entities.map((e) => BudgetRequestItemResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<BudgetRequestItemDTO | BudgetRequestItemDTO[]>,
  ): BudgetRequestItemDTO | BudgetRequestItemDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<BudgetRequestItem | BudgetRequestItem[]>,
  ): BudgetRequestItemDTO | BudgetRequestItemDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
