import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateExpenseDTO } from '../../domain/expense/create.dto';
import { ExpenseService } from '../../services/v1/expense.service';
import { QueryExpenseDTO } from '../../domain/expense/expense.payload.dto';
import {
  ExpenseResponse,
  ExpenseWithPaginationResponse,
} from '../../domain/expense/response.dto';

@Controller('v1/expenses')
@ApiTags('Expense')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class ExpenseController {
  constructor(private svc: ExpenseService) {}

  @Get()
  @ApiOperation({ summary: 'List all Expense' })
  @ApiOkResponse({ type: ExpenseWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: QueryExpenseDTO,
  ): Promise<ExpenseWithPaginationResponse> {
    return await this.svc.list(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get Expense' })
  public async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Expense' })
  @ApiCreatedResponse({
    type: ExpenseResponse,
    description: 'Expense Successfully Created',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateExpenseDTO })
  public async create(@Body() payload: CreateExpenseDTO) {
    return await this.svc.create(payload);
  }

  @Patch('/:id/approve')
  @ApiOperation({ summary: 'Approve Expense' })
  public async approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: string,
  ) {
    return await this.svc.approve(id, payload);
  }

  @Patch('/:id/reject')
  @ApiOperation({ summary: 'Reject Expense' })
  public async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: string,
  ) {
    return await this.svc.reject(id, payload);
  }

  @Get('/:id/attachments')
  @ApiOperation({ summary: 'List Expense Attachment' })
  public async listAttachment(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.listAttachment(id);
  }

  @Post('/:id/attachments')
  @ApiOperation({ summary: 'Create Expense Attachment' })
  public async createAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: string,
  ) {
    return await this.svc.createAttachment(id, payload);
  }

  @Delete('/:id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete Expense Attachment' })
  @ApiNoContentResponse({ description: 'Successfully delete attachment' })
  public async deleteAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('attachmentId', new ParseUUIDPipe()) attachmentId: string,
  ) {
    return await this.svc.deleteAttachment(id, attachmentId);
  }
}
