import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { Employee } from '../../../model/employee.entity';
import { EmployeeDTO } from './employee.dto';
import { EmployeeResponseMapper } from './employee-response.mapper.dto';

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
