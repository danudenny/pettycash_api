import { Body, Controller, Post } from '@nestjs/common';
import { 
  ApiBadRequestResponse, 
  ApiBody, 
  ApiCreatedResponse, 
  ApiInternalServerErrorResponse, 
  ApiOperation, 
  ApiTags 
} from '@nestjs/swagger';
import { CreateAccountDailyClosingDTO } from '../../domain/account-daily-closing/create-account-daily-closing.dto';
import { CreateAccountDailyClosingResponse } from '../../domain/account-daily-closing/create-account-daily-closing.response';
import { AccountDailyClosingService } from '../../services/v1/account-daily-closing.service';

@Controller('v1/daily-closing')
@ApiTags('Account Daily Closing')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class AccountDailyClosingController {

  constructor(private svc: AccountDailyClosingService) {}

  @Post()
  @ApiOperation({ summary: 'Create Account Daily Closing' })
  @ApiCreatedResponse({
    type: CreateAccountDailyClosingResponse,
    description: 'Account Daily Closing Successfully Created'
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateAccountDailyClosingDTO })
  public async create(@Body() payload: CreateAccountDailyClosingDTO) {
    return await this.svc.create(payload);
  }
}
