import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryAccountStatementDTO } from '../../domain/account-statement/account-statement.payload.dto';
import { CreateAccountStatementDTO } from '../../domain/account-statement/create.dto';
import { AccountStatementWithPaginationResponse } from '../../domain/account-statement/response.dto';
import { AccountStatementService } from '../../services/v1/account-statement.service';

@Controller('v1/account-statements')
@ApiTags('Account Statements')
@ApiInternalServerErrorResponse({ description: 'General Error' })
// TODO: Remove after integration with API Gateway
@ApiHeader({ name: 'x-username', description: 'Custom User Request' })
export class AccountStatementController {
  constructor(private svc: AccountStatementService) {}

  @Post()
  @ApiOperation({ summary: 'Create Account Statement (Mutasi Saldo)' })
  @ApiOkResponse({ description: 'Account Statement Successfully created' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async create(@Body() payload: CreateAccountStatementDTO) {
    return await this.svc.create(payload);
  }

  @Get()
  @ApiOperation({
    summary: 'List all Historical Account Statement (Riwayat Saldo)',
  })
  @ApiOkResponse({ type: AccountStatementWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryAccountStatementDTO) {
    return await this.svc.list(query);
  }
}
