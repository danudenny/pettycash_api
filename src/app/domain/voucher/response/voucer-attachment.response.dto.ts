import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../common/base-response.dto';
import { VoucherAttachmentDTO } from '../dto/voucher-attachment.dto';
import { VoucherAttachmentResponseMapper } from '../response-mapper/voucher-attahcment.response.mapper.dto';

export class VoucherAttachmentResponse extends BaseResponse {
  constructor(data?: Partial<VoucherAttachmentDTO | VoucherAttachmentDTO[]>) {
    super();
    if (data) {
      this.data = VoucherAttachmentResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [VoucherAttachmentDTO] })
  data?: VoucherAttachmentDTO | VoucherAttachmentDTO[] = null;
}
