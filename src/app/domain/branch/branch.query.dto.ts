import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePayload } from '../common/base-payload.dto';

export class QueryBranchDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Search by Branch Name (using LIKE sql)',
    example: 'Medan',
  })
  name__icontains: string;

  @ApiPropertyOptional({
    description: 'Search by Branch Code (using LIKE sql)',
    example: '0201001',
  })
  code__icontains: string;
}
