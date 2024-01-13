import {
  Body,
  Controller,
  Get,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateGlobalSettingDTO } from '../../domain/global-setting/global-setting.payload.dto';
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

  @Put()
  @ApiOperation({ summary: 'Update Global Setting' })
  @ApiOkResponse({ description: 'Successfully update global setting' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: UpdateGlobalSettingDTO })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async update(@Body() payload: UpdateGlobalSettingDTO) {
    return await this.svc.update(payload);
  }
}
