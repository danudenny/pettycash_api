import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseResponse } from "../common/base-response.dto";
import { AccountDailyClosingMapper } from "./account-daily-closing.mapper";
import { AccountDailyClosingDTO } from "./account-daily-closing.dto";

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