import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VoucherService } from '../../services/v1/voucher.service';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import { QueryVoucherDTO } from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';

@Controller('v1/vouchers')
@ApiTags('Voucher')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class VoucherController {
	constructor(private vcrService: VoucherService) {
	}

	@Get('')
	@ApiOperation({ summary: 'List all Voucher' })
	@ApiOkResponse({ type: VoucherWithPaginationResponse })
	@ApiBadRequestResponse({ description: 'Bad Request' })
	public async list(
		@Query() query: QueryVoucherDTO,
	): Promise<VoucherWithPaginationResponse> {
		return await this.vcrService.list(query);
	}

	@Get('/:id')
	@ApiOperation({ summary: 'Get Voucher by ID' })
	@ApiOkResponse({ type: VoucherDetailResponse })
	@ApiNotFoundResponse({ description: 'Voucher not found' })
	public async get(@Param('id', new ParseUUIDPipe()) id: string) {
		return await this.vcrService.getById(id);
	}

}
