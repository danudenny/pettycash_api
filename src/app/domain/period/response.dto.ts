import { ApiPropertyOptional } from '@nestjs/swagger';
import { Period } from '../../../model/period.entity';
import { BaseResponse } from '../common/base-response.dto';
import { PeriodDTO } from './period.dto';
import { PeriodResponseMapper } from './response.mapper';

export class PeriodResponse extends BaseResponse {
  constructor(data?: Partial<Period | Period[]>) {
    super();
    if (data) {
      this.data = PeriodResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => [PeriodDTO] })
  data?: PeriodDTO | PeriodDTO[] = null;
}
