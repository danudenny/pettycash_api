import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PingResponse } from '../../domain/other/ping-response.dto';
import { OtherService } from '../../services/v1/other.service';

@Controller('ping')
@ApiTags('Ping')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class PingController {
  constructor(private svc: OtherService) {}

  @Get()
  @ApiOperation({ summary: 'Ping server' })
  @ApiOkResponse({ type: PingResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async ping(@Query() query: Object) {
    return await this.svc.ping();
  }
}
