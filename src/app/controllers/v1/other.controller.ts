import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OtherService } from '../../services/v1/other.service';

@Controller('internal')
@ApiTags('Internal Helper')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class OtherController {
  constructor(private svc: OtherService) {}

  @Get('/clear-cache')
  @ApiOperation({ summary: 'Clear All Cached Data' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiOkResponse({ description: 'Success clear all cached data' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotAcceptableResponse({
    description: 'Not Allowed to perform the action',
  })
  public async clearCache() {
    return await this.svc.clearCache();
  }
}
