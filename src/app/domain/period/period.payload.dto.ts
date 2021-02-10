import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';
import dayjs from 'dayjs';
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

export class GeneratePeriodDTO {
  @ApiPropertyOptional({
    description: 'Period Year',
    example: 2021,
    default: dayjs().year(),
  })
  year?: Number;
}

export class ClosePeriodDTO {
  @ApiPropertyOptional({
    description: 'Close Date',
    example: '2021-02-15',
  })
  @IsISO8601({ strict: false })
  closeDate?: Date;
}
