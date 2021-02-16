import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { Department } from '../../../model/department.entity';
import { DepartmentDTO } from './department.dto';
import { DepartmentResponseMapper } from './department-response.mapper.dto';

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
