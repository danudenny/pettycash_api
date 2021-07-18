import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
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
import { CreateLoanAttachmentDTO } from '../../domain/loan/create-attachment.dto';
import { CreatePaymentLoanDTO } from '../../domain/loan/create-payment.dto';
import { QueryLoanDTO } from '../../domain/loan/loan.query.dto';
import { LoanAttachmentResponse } from '../../domain/loan/response-attachment.dto';
import { LoanDetailResponse } from '../../domain/loan/response-detail.dto';
import { LoanWithPaginationResponse } from '../../domain/loan/response.dto';
import { LoanService } from '../../services/v1/loan.service';
import { CreateLoanDTO } from '../../domain/loan/create.dto';

@Controller('v1/loans')
@ApiTags('Loan')
@ApiInternalServerErrorResponse({ description: 'General Error' })
@ApiHeader({ name: 'x-username', description: 'Custom User Request' })
export class LoanController {
  constructor(private svc: LoanService) {}

  @Post()
  @ApiOperation({ summary: 'Create Loan' })
  @ApiCreatedResponse({ description: 'Loan created' })
  public async create(@Body() payload: CreateLoanDTO) {
    return await this.svc.create(payload);
  }

  @Get()
  @ApiOperation({ summary: 'List all loan' })
  @ApiOkResponse({ type: LoanWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: QueryLoanDTO,
  ): Promise<LoanWithPaginationResponse> {
    return await this.svc.list(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get detail loan' })
  @ApiOkResponse({ type: LoanDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<LoanDetailResponse> {
    return await this.svc.getById(id);
  }

  @Post('/:id/payments')
  @ApiOperation({ summary: 'Create/Add Payments to Loan' })
  @ApiNotFoundResponse({ description: 'Loan not found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreatePaymentLoanDTO })
  public async pay(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: CreatePaymentLoanDTO,
  ) {
    return await this.svc.pay(id, payload);
  }

  @Get('/:id/attachments')
  @ApiOperation({ summary: 'List Loan Attachment' })
  @ApiOkResponse({ type: LoanAttachmentResponse })
  @ApiNotFoundResponse({ description: 'Loan not found' })
  public async listAttachment(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.svc.listAttachment(id);
  }

  @Post('/:id/attachments')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Loan Attachment' })
  @UseInterceptors(FilesInterceptor('attachments'))
  @ApiNotFoundResponse({ description: 'Loan not found' })
  @ApiCreatedResponse({ type: LoanAttachmentResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateLoanAttachmentDTO })
  public async createAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles() attachments: any,
  ) {
    return await this.svc.createAttachment(id, attachments);
  }

  @Delete('/:id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete Expense Attachment' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment ID' })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  @ApiNoContentResponse({ description: 'Successfully delete attachment' })
  public async deleteAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('attachmentId', new ParseUUIDPipe()) attachmentId: string,
    @Res() res: Response,
  ) {
    await this.svc.deleteAttachment(id, attachmentId);
    return res.status(HttpStatus.NO_CONTENT).json();
  }
}
