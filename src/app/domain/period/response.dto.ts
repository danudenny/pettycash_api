import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PeriodDTO } from './period.dto';
import { PeriodResponseMapper } from './response.mapper';

export class PeriodResponse extends BaseResponse {
  constructor(data?: Partial<PeriodDTO | PeriodDTO[]>) {
    super();
    if (data) {
      this.data = PeriodResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [PeriodDTO] })
  data?: PeriodDTO | PeriodDTO[] = null;
}
