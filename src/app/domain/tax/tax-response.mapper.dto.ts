import { TaxDTO } from './tax.dto';
import { AccountTax } from '../../../model/account-tax.entity';

export class TaxResponseMapper {
  public static toDTO(dto: Partial<TaxDTO>): TaxDTO {
    const it = new TaxDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.isHasNpwp = dto.isHasNpwp;
    it.taxInPercent = dto.taxInPercent;
    it.partnerType = dto.partnerType;
    it.coaId = dto.coaId;
    it.coaName = dto.coaName;
    it.coaCode = dto.coaCode;
    return it;
  }

  public static fromOneEntity(ety: Partial<AccountTax>) {
    return this.toDTO({
      id: ety.id,
      name: ety.name,
      isHasNpwp: ety.isHasNpwp,
      taxInPercent: ety.taxInPercent,
      partnerType: ety.partnerType,
      coaId: ety.coaId,
      coaName: ety.coa && ety.coa.name,
      coaCode: ety.coa && ety.coa.code,
    });
  }

  public static fromManyEntity(entities: Partial<AccountTax[]>) {
    return entities.map((e) => TaxResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<TaxDTO[]>) {
    return entities.map((e) => TaxResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<TaxDTO | TaxDTO[]>,
  ): TaxDTO | TaxDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
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
