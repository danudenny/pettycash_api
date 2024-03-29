import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateExpenseDTO } from '../../domain/expense/create.dto';
import { ExpenseService } from '../../services/v1/expense.service';
import { QueryExpenseDTO } from '../../domain/expense/expense.payload.dto';
import {
  ExpenseResponse,
  ExpenseWithPaginationResponse,
} from '../../domain/expense/response.dto';
import { ExpenseAttachmentResponse } from '../../domain/expense/response-attachment.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateExpenseAttachmentDTO } from '../../domain/expense/create-attachment.dto';
import { ApproveExpenseDTO } from '../../domain/expense/approve.dto';
import { RejectExpenseDTO } from '../../domain/expense/reject.dto';
import { ExpenseDetailResponse } from '../../domain/expense/response-detail.dto';
import {
  FindAttachmentIdParams,
  FindExpenseIdParams,
} from '../../domain/common/findId-param.dto';
import { Response } from 'express';
import { UpdateExpenseDTO } from '../../domain/expense/update.dto';
import { UpdateExpenseAttachmentDTO } from '../../domain/expense/update-attachment.dto';

@Controller('v1/expenses')
@ApiTags('Expense')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class ExpenseController {
  constructor(private svc: ExpenseService) {}

  @Get()
  @ApiOperation({ summary: 'List all Expense' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiOkResponse({ type: ExpenseWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: QueryExpenseDTO,
  ): Promise<ExpenseWithPaginationResponse> {
    return await this.svc.list(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get Expense' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiOkResponse({ type: ExpenseDetailResponse })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  public async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.getById(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update Expense' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiOkResponse({ type: ExpenseDetailResponse })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateExpenseDTO,
  ) {
    return await this.svc.update(id, payload);
  }

  @Post()
  @ApiOperation({ summary: 'Create Expense' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
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
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: ApproveExpenseDTO })
  public async approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload?: ApproveExpenseDTO,
  ) {
    return await this.svc.approve(id, payload);
  }

  @Patch('/:id/reject')
  @ApiOperation({ summary: 'Reject Expense' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: RejectExpenseDTO })
  public async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: RejectExpenseDTO,
  ) {
    return await this.svc.reject(id, payload);
  }

  @Get('/:id/attachments')
  @ApiOperation({ summary: 'List Expense Attachment' })
  @ApiOkResponse({ type: ExpenseAttachmentResponse })
  @ApiNotFoundResponse({ description: 'Attachments not found.' })
  public async listAttachment(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.listAttachment(id);
  }

  @Post('/:id/attachments')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Expense Attachment' })
  @UseInterceptors(FilesInterceptor('attachments'))
  @ApiCreatedResponse({ type: ExpenseAttachmentResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateExpenseAttachmentDTO })
  public async createAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles() attachments: any,
    @Body() body: CreateExpenseAttachmentDTO,
  ) {
    return await this.svc.createAttachment(id, attachments, body?.typeId);
  }

  @Put('/:expenseId/attachments/:attachmentId')
  @ApiParam({ name: 'attachmentId' })
  @ApiParam({ name: 'expenseId' })
  @ApiOperation({ summary: 'Update Expense Attachment' })
  @ApiOkResponse({ description: 'Successfully update attachment' })
  public async updateAttachment(
    @Param() { expenseId }: FindExpenseIdParams,
    @Param() { attachmentId }: FindAttachmentIdParams,
    @Body() payload: UpdateExpenseAttachmentDTO,
    @Res() res: Response,
  ) {
    await this.svc.updateAttachment(expenseId, attachmentId, payload);
    return res.status(HttpStatus.OK).json();
  }

  @Delete('/:expenseId/attachments/:attachmentId')
  @ApiParam({ name: 'attachmentId' })
  @ApiParam({ name: 'expenseId' })
  @ApiOperation({ summary: 'Delete Expense Attachment' })
  @ApiNoContentResponse({ description: 'Successfully delete attachment' })
  public async deleteAttachment(
    @Param() { expenseId }: FindExpenseIdParams,
    @Param() { attachmentId }: FindAttachmentIdParams,
    @Res() res: Response,
  ) {
    await this.svc.deleteAttachment(expenseId, attachmentId);
    return res.status(HttpStatus.NO_CONTENT).json();
  }
}
