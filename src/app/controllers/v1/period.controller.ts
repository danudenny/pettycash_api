import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
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
import { Response } from 'express';
import { PeriodResponse } from '../../domain/period/response.dto';
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
  @ApiCreatedResponse({ description: 'Successfully close period.' })
  @ApiBadRequestResponse({ description: 'Failed to close period' })
  public async close(
    @Res() res: Response,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload?: ClosePeriodDTO,
  ) {
    await this.svc.close(id, payload);
    return res.status(HttpStatus.CREATED).json();
  }

  @Put('/:id/open')
  @ApiOperation({ summary: 'Re-Open a closed period' })
  @ApiCreatedResponse({ description: 'Successfully re-open period.' })
  @ApiBadRequestResponse({ description: 'Failed to re-open period' })
  public async open(
    @Res() res: Response,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    await this.svc.open(id);
    return res.status(HttpStatus.CREATED).json();
  }
}
