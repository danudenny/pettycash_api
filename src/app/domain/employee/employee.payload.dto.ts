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
    description: 'Branch ID',
    example: 964,
  })
  branchId: number;

  @ApiPropertyOptional({
    description: 'Employee Role',
    example: 'Sigesit',
  })
  positionName__icontains: string;

  @ApiPropertyOptional({
    description: 'Employee Role ID',
    example: 'e4a9d888-7c05-42b4-a596-dcd0d7a0f2d8',
  })
  positionNameId: string;

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

export class QueryEmployeeRoleDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Employee Role ID',
    example: 'e4a9d888-7c05-42b4-a596-dcd0d7a0f2d8',
  })
  id: string;
}
