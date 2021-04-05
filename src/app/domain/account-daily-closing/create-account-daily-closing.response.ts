import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseResponse } from "../common/base-response.dto";
import { AccountDailyClosingMapper } from "./account-daily-closing.mapper";
import { AccountDailyClosingDTO } from "./account-daily-closing.dto";
import { BasePaginationResponse } from "../common/base-pagination-response.dto";
import { PaginationBuilder } from "../common/pagination-builder";

export class CreateAccountDailyClosingResponse extends BaseResponse {

  constructor(data?: Partial<AccountDailyClosingDTO>) {
    super();
    
    if (data) {
      this.data = AccountDailyClosingMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => AccountDailyClosingDTO })
  data?: AccountDailyClosingDTO = null
}

export class AccountDailyClosingWithPaginationResponse extends BaseResponse {

  constructor(data?: Partial<AccountDailyClosingDTO[]>, params?: any) {
    super();
    
    if (data) {
      this.data = AccountDailyClosingMapper.fromArrayDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => AccountDailyClosingDTO })
  data?: AccountDailyClosingDTO | AccountDailyClosingDTO[] = null

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}