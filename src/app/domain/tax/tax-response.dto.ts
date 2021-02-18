import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { AccountTax } from '../../../model/account-tax.entity';
import { TaxDTO } from './tax.dto';
import { TaxResponseMapper } from './tax-response.mapper.dto';

export class TaxResponse extends BaseResponse {
  constructor(data?: Partial<AccountTax | AccountTax[]>) {
    super();
    if (data) {
      this.data = TaxResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => [TaxDTO] })
  data?: TaxDTO | TaxDTO[] = null;
}
