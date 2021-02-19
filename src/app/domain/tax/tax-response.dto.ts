import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { TaxDTO } from './tax.dto';
import { TaxResponseMapper } from './tax-response.mapper.dto';

export class TaxResponse extends BaseResponse {
  constructor(data?: Partial<TaxDTO | TaxDTO[]>) {
    super();
    if (data) {
      this.data = TaxResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [TaxDTO] })
  data?: TaxDTO | TaxDTO[] = null;
}
