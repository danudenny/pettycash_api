import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../common/base-response.dto';
import { CreateAccountDailyClosingResponseDTO } from '../dto/create-account-daily-closing-response.dto';
import { CreateAccountDailyClosingMapper } from '../mapper/create-account-daily-closing.mapper';

export class CreateAccountDailyClosingResponse extends BaseResponse {
  constructor(data?: Partial<CreateAccountDailyClosingResponseDTO>) {
    super();

    if (data) {
      this.data = CreateAccountDailyClosingMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => CreateAccountDailyClosingResponseDTO })
  data?: CreateAccountDailyClosingResponseDTO = null;
}
