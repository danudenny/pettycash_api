import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseResponse } from "../common/base-response.dto";
import { AccountDailyClosingAttachmentDTO } from "./account-daily-closing-attachment.dto";
import { AccountDailyClosingAttachmentMapper } from "./account-daily-closing-attachment.mapper";

export class CreateAccountDailyClosingAttachmentResponse extends BaseResponse {

  constructor(data?: Partial<AccountDailyClosingAttachmentDTO[]>) {
    super();
    if (data) {
      this.data = AccountDailyClosingAttachmentMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [AccountDailyClosingAttachmentDTO] })
  data?: AccountDailyClosingAttachmentDTO[] = null;
}