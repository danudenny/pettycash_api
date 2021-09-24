import { EmployeeVoucherItem } from './../../../model/employee-voucer-item.entity';
import { EmployeeProductDTO } from './employee.dto';

export class EmployeeProductsResponseMapper {
  public static toDTO(dto: Partial<EmployeeProductDTO>): EmployeeProductDTO {
    const it = new EmployeeProductDTO();
    it.id = dto.id;
    it.allowanceCode = dto.allowanceCode;
    it.allowanceAmount = dto.allowanceAmount;
    return it;
  }

  public static fromOneEntity(ety: Partial<EmployeeVoucherItem>) {
    return this.toDTO({
      id: ety.id,
      allowanceCode: ety.allowance_code,
      allowanceAmount: ety.allowance_amount,
    });
  }

  public static fromManyEntity(entities: Partial<EmployeeVoucherItem[]>) {
    return entities.map((e) => EmployeeProductsResponseMapper.fromOneEntity(e));
  }

  public static fromEntity(
    entities: Partial<EmployeeVoucherItem | EmployeeVoucherItem[]>,
  ): EmployeeProductDTO | EmployeeProductDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
