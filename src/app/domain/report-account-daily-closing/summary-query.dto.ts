import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryReportAccountDailyClosingDTO {
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

  @ApiPropertyOptional({
    description: 'Account Daily Closing Branch ID',
    example: '142648ab-9624-4a7a-a4b4-2f1c51e648d7',
  })
  branchId: string;
}
