import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAccountStatementDTO } from '../../domain/account-statement/create.dto';
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
}
