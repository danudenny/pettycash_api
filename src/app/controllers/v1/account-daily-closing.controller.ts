import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  ParseUUIDPipe, 
  Post, 
  Query
} from '@nestjs/common';
import { 
  ApiBadRequestResponse, 
  ApiBody, 
  ApiCreatedResponse, 
  ApiInternalServerErrorResponse, 
  ApiNotFoundResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiTags 
} from '@nestjs/swagger';
import { CreateAccountDailyClosingDTO } from '../../domain/account-daily-closing/create-account-daily-closing.dto';
import { CreateAccountDailyClosingResponse } from '../../domain/account-daily-closing/create-account-daily-closing.response';
import { AccountDailyClosingDetailResponse } from '../../domain/account-daily-closing/get-account-daily-closing.response';
import { AccountDailyClosingWithPaginationResponse } from '../../domain/account-daily-closing/get-all-account-daily-closing.response';
import { QueryAccountDailyClosingDTO } from '../../domain/account-daily-closing/query-account-daily-closing.payload.dto';
import { AccountDailyClosingService } from '../../services/v1/account-daily-closing.service';

@Controller('v1/daily-closing')
@ApiTags('Account Daily Closing')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class AccountDailyClosingController {

  constructor(private svc: AccountDailyClosingService) {}

  @Get()
  @ApiOperation({ summary: 'List all Account daily closing' })
  @ApiOkResponse({ type: AccountDailyClosingWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: QueryAccountDailyClosingDTO,
  ): Promise<AccountDailyClosingWithPaginationResponse> {
    return await this.svc.list(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get Account Daily Closing Details' })
  @ApiOkResponse({ type: AccountDailyClosingDetailResponse })
  @ApiNotFoundResponse({ description: 'Account Daily Closing not found' })
  public async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.getById(id);
  }

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
