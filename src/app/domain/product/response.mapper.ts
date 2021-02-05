import { Product } from '../../../model/product.entity';
import { ProductDTO } from './product.dto';

export class ProductResponseMapper {
  public static fromDTO(dto: Partial<ProductDTO>): ProductDTO {
    const it = new ProductDTO();
    it.id = dto.id;
    it.code = dto.code;
    it.name = dto.name;
    it.description = dto.description;
    it.isHasTax = dto.isHasTax;
    it.amount = dto.amount;
    it.coaId = dto.coaId;
    it.isActive = dto.isActive;
    return it;
  }

  public static fromOneEntity(ety: Partial<Product>) {
    return this.fromDTO({
      id: ety.id,
      code: ety.code,
      name: ety.name,
      description: ety.description,
      isHasTax: ety.isHasTax,
      amount: ety.amount,
      coaId: ety.coaId,
      isActive: ety.isActive,
    });
  }

  public static fromManyEntity(entities: Partial<Product[]>) {
    return entities.map((e) => ProductResponseMapper.fromOneEntity(e));
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
