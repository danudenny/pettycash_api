import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBalanceDTO } from '../../domain/balance/balance.query.dto';
import { BalanceWithPaginationResponse } from '../../domain/balance/response.dto';
import { BalanceService } from '../../services/v1/balance.service';

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
}
