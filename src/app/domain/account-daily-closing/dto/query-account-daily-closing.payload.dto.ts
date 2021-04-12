import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePayload } from '../../common/base-payload.dto';

export class QueryAccountDailyClosingDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Account Daily Closing Start Date',
    example: '2021-01-01',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'Account Daily Closing End Date',
    example: '2021-12-31',
  })
  endDate__lte: Date;
}
