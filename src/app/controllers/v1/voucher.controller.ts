import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Response,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation, ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { VoucherService } from '../../services/v1/voucher.service';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import {
  QueryVoucherDTO,
} from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { PrintService } from '../../services/v1/print.service';
import express = require('express');

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

  @Get('/:id')
  @ApiOperation({ summary: 'Get Voucher by ID' })
  @ApiOkResponse({ status: HttpStatus.OK, type: VoucherDetailResponse })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  public async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.vcrService.getById(id);
  }

  @Get('/print/:id')
  @ApiParam({name: 'id'})
  @ApiOkResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'Print Voucher' })
  public async print(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() queryParams: any,
    @Response() serverResponse: express.Response,
  ) {
    return await this.printService.printVoucher(serverResponse, id, queryParams);
  }
}
