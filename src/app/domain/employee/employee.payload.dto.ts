import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePayload } from '../common/base-payload.dto';

export class QueryEmployeeDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Employee NIK',
    example: '20090134',
  })
  nik__icontains: string;

  @ApiPropertyOptional({
    description: 'Employee Name',
    example: 'Denny Danuwijaya',
  })
  name__icontains: string;

  @ApiPropertyOptional({
    description: 'Employee Status',
    example: true,
  })
  employeeStatus: boolean;
}

export class QueryVoucherEmployeeDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Employee NIK',
    example: '20090134',
  })
  nik__icontains: string;

  @ApiPropertyOptional({
    description: 'Employee Name',
    example: 'Denny Danuwijaya',
  })
  name__icontains: string;
}
