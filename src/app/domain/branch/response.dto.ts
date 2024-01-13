import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BranchDTO } from './branch.dto';
import { BranchResponseMapper } from './response.mapper';

export class BranchWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<BranchDTO | BranchDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = BranchResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [BranchDTO] })
  data?: BranchDTO | BranchDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
