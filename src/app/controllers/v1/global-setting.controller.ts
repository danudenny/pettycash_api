import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GlobalSettingResponse } from '../../domain/global-setting/response.dto';
import { GlobalSettingService } from '../../services/v1/global-setting.service';

@Controller('v1/settings')
@ApiTags('Global Setting')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class GlobalSettingController {
  constructor(private svc: GlobalSettingService) {}

  @Get()
  @ApiOperation({ summary: 'Get Global Setting' })
  @ApiOkResponse({ type: GlobalSettingResponse })
  public async get() {
    return await this.svc.get();
  }
}
