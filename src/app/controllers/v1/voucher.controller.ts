import { VoucherResponse } from './../../domain/voucher/response/voucher.response.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
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
import { VoucherCreateDTO } from '../../domain/voucher/dto/voucher-create.dto';
import { ProductService } from '../../services/master/v1/product.service';
import { ProductWithPaginationResponse } from '../../domain/product/response.dto';

@Controller('v1/vouchers')
@ApiTags('Voucher')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class VoucherController {
  constructor(
    private vcrService: VoucherService,
    private printService: PrintService,
    private prodService: ProductService,
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

  @Get('products')
  @ApiOperation({ summary: 'List all Voucher Product' })
  @ApiOkResponse({ type: ProductWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async products() {
    return await this.prodService.voucher();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get Voucher by ID' })
  @ApiOkResponse({ status: HttpStatus.OK, type: VoucherDetailResponse })
  @ApiNotFoundResponse({ description: 'Voucher not found' })
  public async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.vcrService.getById(id);
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
}
