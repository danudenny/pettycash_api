import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../common/base-response.dto';
import { AccountDailyClosingMapper } from '../mapper/account-daily-closing.mapper';
import { AccountDailyClosing } from '../../../../model/account-daily-closing.entity';
import { AccountDailyClosingDetailDTO } from '../dto/account-daily-closing-detail.dto';

export class AccountDailyClosingDetailResponse extends BaseResponse {
  constructor(data?: Partial<AccountDailyClosing>) {
    super();
    if (data) {
      this.data = AccountDailyClosingMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => AccountDailyClosingDetailDTO })
  data?: AccountDailyClosingDetailDTO = null;
}
