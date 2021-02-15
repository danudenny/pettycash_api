import { ApiPropertyOptional } from '@nestjs/swagger';
import { GlobalSetting } from '../../../model/global-setting.entity';
import { BaseResponse } from '../common/base-response.dto';
import { GlobalSettingDTO } from './global-setting.dto';
import { GlobalSettingResponseMapper } from './response.mapper';

export class GlobalSettingResponse extends BaseResponse {
  constructor(data?: Partial<GlobalSetting>) {
    super();
    if (data) {
      this.data = GlobalSettingResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => GlobalSettingDTO })
  data?: GlobalSettingDTO = null;
}
