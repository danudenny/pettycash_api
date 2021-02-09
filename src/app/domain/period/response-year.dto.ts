import { ApiPropertyOptional } from '@nestjs/swagger';
import { Period } from '../../../model/period.entity';
import { BaseResponse } from '../common/base-response.dto';
import { PeriodYearDTO } from './period-year.dto';
import { PeriodYearResponseMapper } from './response-year.mapper';

export class PeriodYearResponse extends BaseResponse {
  constructor(data?: Partial<Period | Period[]>) {
    super();
    if (data) {
      this.data = PeriodYearResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => [PeriodYearDTO] })
  data?: PeriodYearDTO | PeriodYearDTO[] = null;
}
