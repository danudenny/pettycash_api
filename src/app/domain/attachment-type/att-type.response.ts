import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseResponse } from "../common/base-response.dto";
import { AttachmentTypeDTO } from "./att-type.dto";
import { AttachmentTypeResponseMapper } from "./att-type.response.mapper";

export class AttachmentTypeResponse extends BaseResponse {
  constructor(data?: Partial<AttachmentTypeDTO | AttachmentTypeDTO[]>) {
    super();
    if (data) {
      this.data = AttachmentTypeResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [AttachmentTypeDTO] })
  data?: AttachmentTypeDTO | AttachmentTypeDTO[] = null;
}