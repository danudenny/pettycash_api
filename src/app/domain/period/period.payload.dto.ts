import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePayload } from '../common/base-payload.dto';

export class QueryPeriodDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Period Year',
    example: 2021,
  })
  year: Number;

  @ApiPropertyOptional({
    description: 'Period Status',
    example: 'open',
    enum: ['open', 'close'],
  })
  state: string;
}
