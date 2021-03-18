import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
    description: 'Employee ID Card Number',
    example: '20090134',
  })
  idCardNumber__icontains: string;

  @ApiPropertyOptional({
    description: 'Employee Branch',
    example: 1,
  })
  branchId: Number;
}
