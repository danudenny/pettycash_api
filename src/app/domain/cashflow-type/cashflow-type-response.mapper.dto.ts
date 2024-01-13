import { CashflowTypeDto } from './cashflow-type.dto';
import { CashflowType } from '../../../model/cashflow-type.entity';

export class CashFlowResponseMapper {
  public static toDTO(dto: Partial<CashflowTypeDto>): CashflowTypeDto {
    const it = new CashflowTypeDto();
    it.id = dto.id;
    it.name = dto.name;
    it.coaId = dto.coaId;
    it.coaCode = dto.coaCode;
    it.coaName = dto.coaName;
    it.isActive = dto.isActive;
    return it;
  }

  public static fromOneEntity(ety: Partial<CashflowType>) {
    return this.toDTO({
      id: ety.id,
      name: ety.name,
      coaCode: ety.coaProduct && ety.coaProduct.code,
      isActive: ety.isActive,
    });
  }

  public static fromManyEntity(entities: Partial<CashflowType[]>) {
    return entities.map((e) => CashFlowResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<CashflowTypeDto[]>) {
    return entities.map((e) => CashFlowResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<CashflowTypeDto | CashflowTypeDto[]>,
  ): CashflowTypeDto | CashflowTypeDto[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<CashflowType | CashflowType[]>,
  ): CashflowTypeDto | CashflowTypeDto[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}

