import { ApiPropertyOptional } from '@nestjs/swagger';
import { Journal } from '../../../model/journal.entity';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { JournalDTO } from './journal.dto';
import { JournalResponseMapper } from './response.mapper';

export class JournalWithPaginationResponse extends BaseResponse {
  constructor(data?: Journal[], params?: any) {
    super();
    if (data) {
      this.data = JournalResponseMapper.fromEntity(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [JournalDTO] })
  data?: JournalDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
