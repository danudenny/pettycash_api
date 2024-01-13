import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PeriodActionResponse,
  PeriodResponse,
} from '../../domain/period/response.dto';
import { PeriodYearResponse } from '../../domain/period/response-year.dto';
import { PeriodService } from '../../services/v1/period.service';
import {
  ClosePeriodDTO,
  GeneratePeriodDTO,
  QueryPeriodDTO,
} from '../../domain/period/period.payload.dto';

@Controller('v1/periods')
@ApiTags('Period')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class PeriodController {
  constructor(private svc: PeriodService) {}

  @Get()
  @ApiOperation({ description: 'List all periods.' })
  @ApiOkResponse({ type: PeriodResponse })
  public async list(@Query() query: QueryPeriodDTO) {
    return await this.svc.list(query);
  }

  @Get('/years')
  @ApiOperation({ summary: 'List all period years.' })
  @ApiOkResponse({ type: PeriodYearResponse })
  public async listYear() {
    return await this.svc.listYear();
  }

  @Post('/generate')
  @ApiOperation({ summary: 'Generate Period for a year' })
  @ApiCreatedResponse({ description: 'Period successfully generated' })
  @ApiBadRequestResponse({ description: 'Failed to generated period' })
  @ApiBody({ type: GeneratePeriodDTO })
  public async generate(@Body() payload?: GeneratePeriodDTO) {
    return await this.svc.generate(payload);
  }

  @Put('/:id/close')
  @ApiOperation({ summary: 'Close a period' })
  @ApiOkResponse({
    description: 'Successfully close period.',
    type: PeriodActionResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to close period' })
  public async close(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload?: ClosePeriodDTO,
  ) {
    return await this.svc.close(id, payload);
  }

  @Put('/:id/open')
  @ApiOperation({ summary: 'Re-Open a closed period' })
  @ApiOkResponse({
    description: 'Successfully re-open period.',
    type: PeriodActionResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to re-open period' })
  public async open(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.open(id);
  }
}
