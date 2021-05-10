import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { PartnerAttachmentDTO } from './partner-attahcment.dto';
import { PartnerAttachmentResponseMapper } from './response-attachment.mapper.dto';

export class PartnerAttachmentResponse extends BaseResponse {
  constructor(data?: Partial<PartnerAttachmentDTO | PartnerAttachmentDTO[]>) {
    super();
    if (data) {
      this.data = PartnerAttachmentResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [PartnerAttachmentDTO] })
  data?: PartnerAttachmentDTO | PartnerAttachmentDTO[] = null;
}
