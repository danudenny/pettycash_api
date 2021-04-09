import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { VoucherService } from '../../services/v1/voucher.service';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import { QueryVoucherDTO, QueryVoucherSunfishDTO } from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { CreateVoucherDTO } from '../../domain/voucher/dto/voucher-create.dto';

@Controller('v1/vouchers')
@ApiTags('Voucher')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class VoucherController {
	constructor(private vcrService: VoucherService) {
	}

	@Get('')
	@ApiOperation({ summary: 'List all Voucher' })
	@ApiOkResponse({ status: HttpStatus.OK, type: VoucherWithPaginationResponse })
	@ApiBadRequestResponse({ description: 'Bad Request' })
	public async list(
		@Query() query: QueryVoucherDTO,
	): Promise<VoucherWithPaginationResponse> {
		return await this.vcrService.list(query);
	}

	@Get('/sunfish')
	@ApiOkResponse({ status: HttpStatus.OK, description: 'Success Get Data' })
	@ApiBadRequestResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Bad Request',
	})
	public async getSunfish(@Query() query: QueryVoucherSunfishDTO,) {
		return await this.vcrService.getSunfish(query);
	}

	@Get('/:id')
	@ApiOperation({ summary: 'Get Voucher by ID' })
	@ApiOkResponse({ status: HttpStatus.OK, type: VoucherDetailResponse })
	@ApiNotFoundResponse({ description: 'Voucher not found' })
	public async get(@Param('id', new ParseUUIDPipe()) id: string) {
		return await this.vcrService.getById(id);
	}

	@Post('/load')
	@ApiOkResponse({ status: HttpStatus.OK })
	@ApiOperation({ summary: 'Create Voucher from Temp Table' })
	public async load(@Body() data: CreateVoucherDTO) {
		return this.vcrService.tempToVoucher(data)
	}

}
