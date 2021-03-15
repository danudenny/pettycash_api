import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { LoanDTO } from './loan.dto';
import { LoanDetailResponseMapper } from './response-detail.mapper';

export class LoanDetailResponse extends BaseResponse {
  constructor(data?: LoanDTO, params?: any) {
    super();
    if (data) {
      this.data = LoanDetailResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => LoanDTO })
  data?: LoanDTO = null;
}
