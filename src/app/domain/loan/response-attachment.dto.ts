import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { LoanAttachmentDTO } from './loan-attachment.dto';
import { LoanAttachmentResponseMapper } from './response-attachment.mapper';

export class LoanAttachmentResponse extends BaseResponse {
  constructor(data?: Partial<LoanAttachmentDTO | LoanAttachmentDTO[]>) {
    super();
    if (data) {
      this.data = LoanAttachmentResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [LoanAttachmentDTO] })
  data?: LoanAttachmentDTO | LoanAttachmentDTO[] = null;
}
