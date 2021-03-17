import { ApiPropertyOptional } from '@nestjs/swagger';
import { Loan } from '../../../model/loan.entity';
import { BaseResponse } from '../common/base-response.dto';
import { LoanDetailDTO } from './loan-detail.dto';
import { LoanDetailResponseMapper } from './response-detail.mapper';

export class LoanDetailResponse extends BaseResponse {
  constructor(data?: Loan) {
    super();
    if (data) {
      this.data = LoanDetailResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => LoanDetailDTO })
  data?: LoanDetailDTO = null;
}
