import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { BankBranchDTO } from './bank-branch.dto';
import { BankBranchResponseMapper } from './response.mapper';

export class BankBranchWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<BankBranchDTO | BankBranchDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = BankBranchResponseMapper.fromQueryBuilder(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [BankBranchDTO] })
  data?: BankBranchDTO | BankBranchDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}
