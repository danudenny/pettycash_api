import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { JournalDTO } from './journal.dto';
import { JournalResponseMapper } from './response.mapper';

export class JournalWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<JournalDTO | JournalDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = JournalResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [JournalDTO] })
  data?: JournalDTO | JournalDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
