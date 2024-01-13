import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySummaryBalanceDTO {
  @ApiPropertyOptional({
    example: false,
    description: 'Force to not use cache',
  })
  noCache?: boolean;
}
