import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { BatchJournalDTO } from './batch-journal.dto';
import { JournalBatchResponseMapper } from './response-batch.mapper';

export class JournalBatchResponse extends BaseResponse {
  constructor(data?: any) {
    super();
    if (data) {
      this.data = JournalBatchResponseMapper.fromObject(data);
    }
  }

  @ApiPropertyOptional({ type: () => BatchJournalDTO })
  data?: BatchJournalDTO = null;
}
