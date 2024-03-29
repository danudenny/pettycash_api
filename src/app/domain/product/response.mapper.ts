import { Product } from '../../../model/product.entity';
import { ProductDTO } from './product.dto';

export class ProductResponseMapper {
  public static toDTO(dto: Partial<ProductDTO>): ProductDTO {
    const it = new ProductDTO();
    it.id = dto.id;
    it.code = dto.code;
    it.name = dto.name;
    it.description = dto.description;
    it.isHasTax = dto.isHasTax;
    it.amount = dto.amount;
    it.coaId = dto.coaId;
    it.coaCode = dto.coaCode;
    it.coaName = dto.coaName;
    it.isActive = dto.isActive;
    it.isHasKm = dto.isHasKm;
    it.taxType = dto.taxType;
    it.type = dto.type;
    return it;
  }

  public static fromOneEntity(ety: Partial<Product>) {
    return this.toDTO({
      id: ety.id,
      code: ety.code,
      name: ety.name,
      description: ety.description,
      isHasTax: ety.isHasTax,
      amount: ety.amount,
      coaId: ety.coaId,
      coaCode: ety.coaProduct && ety.coaProduct.code,
      coaName: ety.coaProduct && ety.coaProduct.name,
      isActive: ety.isActive,
      isHasKm: ety.isHasKm,
      taxType: ety.taxType,
      type: ety.type,
    });
  }

  public static fromManyEntity(entities: Partial<Product[]>) {
    return entities.map((e) => ProductResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<ProductDTO[]>) {
    return entities.map((e) => ProductResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<ProductDTO | ProductDTO[]>,
  ): ProductDTO | ProductDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<Product | Product[]>,
  ): ProductDTO | ProductDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
