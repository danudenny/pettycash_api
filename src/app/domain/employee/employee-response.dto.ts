import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { Employee } from '../../../model/employee.entity';
import { EmployeeDTO } from './employee.dto';
import { EmployeeResponseMapper } from './employee-response.mapper.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';

export class EmployeeResponse extends BaseResponse {
  constructor(data?: Partial<Employee | Employee[]>) {
    super();
    if (data) {
      this.data = EmployeeResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => [EmployeeDTO] })
  data?: EmployeeDTO | EmployeeDTO[] = null;
}

export class EmployeeWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<EmployeeDTO | EmployeeDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = EmployeeResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [EmployeeDTO] })
  data?: EmployeeDTO | EmployeeDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
