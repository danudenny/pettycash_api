/** Interfaces */
import { ReportBudgetDTO } from './report-budget.dto';

export class ReportBudgetResponseMapper {
  public static toDTO(
    dto: Partial<ReportBudgetDTO>,
  ): ReportBudgetDTO {
    const budget = new ReportBudgetDTO();
    budget.id = dto.id;
    budget.number = dto.number;
    budget.branchName = dto.branchName;
    budget.responsibleUser = dto.responsibleUser;
    budget.startDate = dto.startDate;
    budget.endtDate = dto.endtDate;
    budget.productName = dto.productName;
    budget.totalAmount = +dto.totalAmount;
    budget.expendseAmount = +dto.expendseAmount;
    return budget;
  }

  public static toManyDTO(entities: Partial<any[]>) {
    return entities.map((e) => ReportBudgetResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<ReportBudgetDTO | ReportBudgetDTO[]>,
  ): ReportBudgetDTO | ReportBudgetDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
