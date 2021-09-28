import { QueryVoucherEmployeeDTO } from './../../domain/employee/employee.payload.dto';
import { VoucherResponse } from './../../domain/voucher/response/voucher.response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Response,
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
import { VoucherService } from '../../services/v1/voucher.service';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import { QueryVoucherDTO } from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { PrintService } from '../../services/v1/print.service';
import express = require('express');
import {
  BatchPayloadVoucherDTO,
  VoucherCreateDTO,
} from '../../domain/voucher/dto/voucher-create.dto';
import { ProductService } from '../../services/master/v1/product.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { VoucherAttachmentResponse } from '../../domain/voucher/response/voucer-attachment.response.dto';
import { CreateVoucherAttachmentDTO } from '../../domain/voucher/dto/create-attachment.dto';
import {
  FindAttachmentIdParams,
  FindVoucherIdParams,
} from '../../domain/common/findId-param.dto';
import { EmployeeWithPaginationResponse } from '../../domain/employee/employee-response.dto';
import { EmployeeProductResponse } from '../../domain/employee/employee-product-response.dto';

@Controller('v1/vouchers')
@ApiTags('Voucher')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class VoucherController {
  constructor(
    private vcrService: VoucherService,
    private printService: PrintService,
  ) {}

  @Get('')
  @ApiOperation({ summary: 'List all Voucher' })
  @ApiOkResponse({ status: HttpStatus.OK, type: VoucherWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: QueryVoucherDTO,
  ): Promise<VoucherWithPaginationResponse> {
    return await this.vcrService.list(query);
  }

  // @Get('products')
  // @ApiOperation({ summary: 'List all Voucher Product' })
  // @ApiOkResponse({ type: ProductWithPaginationResponse })
  // @ApiBadRequestResponse({ description: 'Bad Request' })
  // public async products() {
  //   return await this.prodService.voucher();
  // }

  @Get('/employees')
  @ApiOperation({ summary: 'Get Employee' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    type: EmployeeWithPaginationResponse,
  })
  public async getEmployee(
    @Query() query?: QueryVoucherEmployeeDTO,
  ): Promise<EmployeeWithPaginationResponse> {
    return await this.vcrService.getEmployee(query);
  }

  @Get('/employees/:id')
  @ApiOperation({ summary: 'Get Product By Employee ID' })
  @ApiOkResponse({ status: HttpStatus.OK, type: EmployeeProductResponse })
  public async getProductByEmployeeId(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.vcrService.getProductByEmployeeId(id);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get Voucher by ID' })
  @ApiOkResponse({ status: HttpStatus.OK, type: VoucherDetailResponse })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  public async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.vcrService.getById(id);
  }

  @Get('/:id/attachments')
  @ApiOperation({ summary: 'List Voucher Attachment' })
  @ApiOkResponse({ type: VoucherAttachmentResponse })
  @ApiNotFoundResponse({ description: 'Attachments not found.' })
  public async listAttachment(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.vcrService.listAttachment(id);
  }

  @Get('/print/:id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'Print Voucher' })
  public async print(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() queryParams: any,
    @Response() serverResponse: express.Response,
  ) {
    return await this.printService.printVoucher(
      serverResponse,
      id,
      queryParams,
    );
  }

  @Post('create')
  @ApiOperation({ summary: 'Create Voucher' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiCreatedResponse({
    type: VoucherResponse,
    description: 'Voucher Successfully Created',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: VoucherCreateDTO })
  public async create(@Body() payload: VoucherCreateDTO) {
    return await this.vcrService.create(payload);
  }

  @Put('/redeem')
  @ApiOperation({ summary: 'Batch Redeem Voucher' })
  @ApiOkResponse({ description: 'Successfully approve voucher' })
  @ApiBadRequestResponse({ description: 'Failed to batch approve voucher' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: BatchPayloadVoucherDTO })
  public async redeem(@Body() data: BatchPayloadVoucherDTO) {
    return await this.vcrService.redeem(data);
  }

  @Post('/:id/attachments')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Voucher Attachment' })
  @UseInterceptors(FilesInterceptor('attachments'))
  @ApiCreatedResponse({ type: VoucherAttachmentResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateVoucherAttachmentDTO })
  public async createAttachment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles() attachments: any,
  ) {
    return await this.vcrService.createAttachment(id, attachments);
  }

  @Delete('/:voucherId/attachments/:attachmentId')
  @ApiParam({ name: 'attachmentId' })
  @ApiParam({ name: 'voucherId' })
  @ApiOperation({ summary: 'Delete Voucher Attachment' })
  @ApiNoContentResponse({ description: 'Successfully delete attachment' })
  public async deleteAttachment(
    @Param() { voucherId }: FindVoucherIdParams,
    @Param() { attachmentId }: FindAttachmentIdParams,
  ) {
    return await this.vcrService.deleteAttachment(voucherId, attachmentId);
  }
}
