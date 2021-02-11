import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { AccountCoaDTO } from './accounta-ca.dto';
import { AccountCoaResponseMapper } from './response.mapper';

export class AccountCoaResponse extends BaseResponse {
  constructor(data?: Partial<AccountCoaDTO | AccountCoaDTO[]>) {
    super();
    if (data) {
      this.data = AccountCoaResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [AccountCoaDTO] })
  data?: AccountCoaDTO | AccountCoaDTO[] = null;
}
