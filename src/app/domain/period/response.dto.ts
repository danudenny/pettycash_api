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

/**
 * Period Action (open, close) Response
 */
export class PeriodActionResponse extends BaseResponse {
  constructor(data?: any) {
    super();
    if (data) {
      this.data = PeriodResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => PeriodDTO })
  data?: PeriodDTO | PeriodDTO[] = null;
}
