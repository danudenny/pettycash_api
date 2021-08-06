import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryEmployeeDTO {
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
