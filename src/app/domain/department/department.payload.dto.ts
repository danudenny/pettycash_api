import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDepartmentDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Department Code',
    example: 'DP001',
  })
  code__icontains: string;

  @ApiPropertyOptional({
    description: 'Department Name',
    example: 'Accounting',
  })
  name__icontains: string;
}
