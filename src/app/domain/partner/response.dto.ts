import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PartnerDTO } from './partner.dto';
import { PartnerResponseMapper } from './response.mapper';

export class PartnerResponse extends BaseResponse {
  constructor(data?: Partial<PartnerDTO | PartnerDTO[]>) {
    super();
    if (data) {
      this.data = PartnerResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [PartnerDTO] })
  data?: PartnerDTO | PartnerDTO[] = null;
}
