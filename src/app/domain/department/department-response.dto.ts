import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { Department } from '../../../model/department.entity';
import { DepartmentDTO } from './department.dto';
import { DepartmentResponseMapper } from './department-response.mapper.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';

export class DepartmentResponse extends BaseResponse {
  constructor(data?: Partial<Department | Department[]>) {
    super();
    if (data) {
      this.data = DepartmentResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => [DepartmentDTO] })
  data?: DepartmentDTO | DepartmentDTO[] = null;
}

export class DepartmentWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<DepartmentDTO | DepartmentDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = DepartmentResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [DepartmentDTO] })
  data?: DepartmentDTO | DepartmentDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
