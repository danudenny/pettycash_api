import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  ParseUUIDPipe, 
  Post, 
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { 
  ApiBadRequestResponse, 
  ApiBody, 
  ApiConsumes, 
  ApiCreatedResponse, 
  ApiInternalServerErrorResponse, 
  ApiNotFoundResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiTags 
} from '@nestjs/swagger';
import { CreateAccountDailyClosingAttachmentDTO } from '../../domain/account-daily-closing/dto/create-account-daily-closing-attachment.dto';
import { AccountDailyClosingAttachmentResponse } from '../../domain/account-daily-closing/response/account-daily-closing-attachments.response';
import { CreateAccountDailyClosingDTO } from '../../domain/account-daily-closing/dto/create-account-daily-closing.dto';
import { CreateAccountDailyClosingResponse } from '../../domain/account-daily-closing/response/create-account-daily-closing.response';
import { AccountDailyClosingDetailResponse } from '../../domain/account-daily-closing/response/get-account-daily-closing.response';
import { AccountDailyClosingWithPaginationResponse } from '../../domain/account-daily-closing/response/get-all-account-daily-closing.response';
import { QueryAccountDailyClosingDTO } from '../../domain/account-daily-closing/dto/query-account-daily-closing.payload.dto';
import { AccountDailyClosingService } from '../../services/v1/account-daily-closing.service';

@Controller('v1/account-daily-closing')
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

  @Get('/:id/attachments')
  @ApiOperation({ summary: 'List of Account Daily Closing Attachment' })
  @ApiOkResponse({ type: AccountDailyClosingAttachmentResponse })
  @ApiNotFoundResponse({ description: 'Attachments not found.' })
  public async listAttachment(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.listAttachment(id);
  }

  @Post('/:id/attachments')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Account Daily Closing Attachment' })
  @UseInterceptors(FilesInterceptor('attachments'))
  @ApiCreatedResponse({ type: AccountDailyClosingAttachmentResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateAccountDailyClosingAttachmentDTO })
  public async createAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles() attachments: any,
  ) {
    return await this.svc.createAttachment(id, attachments);
  }
}
