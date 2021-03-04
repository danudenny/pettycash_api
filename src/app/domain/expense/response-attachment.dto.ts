import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { ExpenseAttachmentDTO } from './expense-attachment.dto';
import { ExpenseAttachmentResponseMapper } from './response-attachment.mapper';

export class ExpenseAttachmentResponse extends BaseResponse {
  constructor(data?: Partial<ExpenseAttachmentDTO | ExpenseAttachmentDTO[]>) {
    super();
    if (data) {
      this.data = ExpenseAttachmentResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [ExpenseAttachmentDTO] })
  data?: ExpenseAttachmentDTO | ExpenseAttachmentDTO[] = null;
}
