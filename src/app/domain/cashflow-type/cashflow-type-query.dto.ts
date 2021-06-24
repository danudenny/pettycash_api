import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCashFlowTypeDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Cashflow Type Name',
    example: 'Kas Masuk',
  })
  name__icontains: string

  @ApiPropertyOptional({
    description: 'Coa ID',
  })
  coaId: string

  @ApiPropertyOptional({
    description: 'Cashflow Type Active',
    example: true,
  })
  isActive: boolean
}