import { EmployeeVoucherItem } from '../../../model/employee-voucer-item.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { EmployeeProductDTO } from './employee.dto';
import { EmployeeProductsResponseMapper } from './employee-products-response.mapper.dto';

export class EmployeeProductResponse extends BaseResponse {
  constructor(data?: Partial<EmployeeVoucherItem | EmployeeVoucherItem[]>) {
    super();
    if (data) {
      this.data = EmployeeProductsResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => [EmployeeProductDTO] })
  data?: EmployeeProductDTO | EmployeeProductDTO[] = null;
}
