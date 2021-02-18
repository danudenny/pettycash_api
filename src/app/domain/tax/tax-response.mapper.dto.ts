import { TaxDTO } from './tax.dto';
import { AccountTax } from '../../../model/account-tax.entity';

export class TaxResponseMapper {
  public static fromDTO(dto: Partial<TaxDTO>): TaxDTO {
    const it = new TaxDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.isHasNpwp = dto.isHasNpwp;
    it.taxInPercent = dto.taxInPercent;
    it.partnerType = dto.partnerType;
    it.coaId = dto.coaId;
    return it;
  }

  public static fromOneEntity(ety: Partial<AccountTax>) {
    return this.fromDTO({
      id: ety.id,
      name: ety.name,
      isHasNpwp: ety.isHasNpwp,
      taxInPercent: ety.taxInPercent,
      partnerType: ety.partnerType,
      coaId: ety.coaId,
    });
  }

  public static fromManyEntity(entities: Partial<AccountTax[]>) {
    return entities.map((e) => TaxResponseMapper.fromOneEntity(e));
  }

  public static fromEntity(
    entities: Partial<AccountTax | AccountTax[]>,
  ): TaxDTO | TaxDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
