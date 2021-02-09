import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryPeriodYearDTO } from '../../domain/period/period-year.payload.dto';
import { PeriodResponse } from '../../domain/period/response.dto';
import { PeriodYearResponse } from '../../domain/period/response-year.dto';
import { PeriodService } from '../../services/v1/period.service';

@Controller('v1/periods')
@ApiTags('Period')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class PeriodController {
  constructor(private svc: PeriodService) {}

  @Get()
  @ApiOperation({ description: 'List all periods.' })
  @ApiOkResponse({ type: PeriodResponse })
  public async list(@Query() query?: any) {
    return await this.svc.list(query);
  }

  @Get('/years')
  @ApiOperation({ summary: 'List all period years.' })
  @ApiOkResponse({ type: PeriodYearResponse })
  public async listYear(@Query() query: QueryPeriodYearDTO) {
    return await this.svc.listYear(query);
  }
}
