import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBalanceDTO } from '../../domain/balance/balance.query.dto';
import { BalanceWithPaginationResponse } from '../../domain/balance/response.dto';
import { BalanceService } from '../../services/v1/balance.service';
import { QuerySummaryBalanceDTO } from '../../domain/balance/summary-balance.query.dto';
import { BalanceSummaryResponse } from '../../domain/balance/summary-response.dto';

@Controller('v1/balances')
@ApiTags('Balance')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class BalanceController {
  constructor(private svc: BalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all balances (saldo cabang)' })
  @ApiOkResponse({ type: BalanceWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async get(@Query() query?: QueryBalanceDTO) {
    return await this.svc.list(query);
  }

  @Get('/summary')
  @ApiOperation({ summary: 'Get summary balances branch\'s (saldo cabang)' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiOkResponse({ type: BalanceSummaryResponse })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async getSummary(@Query() query?: QuerySummaryBalanceDTO) {
    return await this.svc.getSummary(query);
  }
}
