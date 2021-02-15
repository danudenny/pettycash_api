import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryAccountCoaDTO } from '../../domain/account-coa/account-coa.payload.dto';
import { AccountCoaResponse } from '../../domain/account-coa/response.dto';
import { AccountCoaService } from '../../services/v1/account-coa.service';

@Controller('v1/chart-of-accounts')
@ApiTags('Chart of Accounts')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class AccountCoaController {
  constructor(private svc: AccountCoaService) {}

  @Get()
  @ApiOperation({ summary: 'List all Chart of Accounts' })
  @ApiOkResponse({ type: AccountCoaResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryAccountCoaDTO) {
    return await this.svc.list(query);
  }
}
