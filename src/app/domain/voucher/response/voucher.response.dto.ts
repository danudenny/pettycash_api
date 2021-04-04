import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../common/base-response.dto';
import { VoucherDTO } from '../dto/voucher.dto';
import { PaginationBuilder } from '../../common/pagination-builder';
import { BasePaginationResponse } from '../../common/base-pagination-response.dto';
import { VoucherResponseMapper } from '../response-mapper/voucher.response.mapper.dto';

export class VoucherResponse extends BaseResponse {
	constructor(data?: Partial<VoucherDTO | VoucherDTO[]>) {
		super();
		if (data) {
			this.data = VoucherResponseMapper.fromDTO(data);
		}
	}

	@ApiPropertyOptional({ type: () => VoucherDTO })
	data?: VoucherDTO | VoucherDTO[] = null;
}

export class VoucherWithPaginationResponse extends BaseResponse {
	constructor(data?: Partial<VoucherDTO | VoucherDTO[]>, params?: any) {
		super();
		if (data) {
			this.data = VoucherResponseMapper.fromDTO(data);
			this.meta = PaginationBuilder.build(data, params);
		}
	}

	@ApiPropertyOptional({ type: () => [VoucherDTO] })
	data?: VoucherDTO | VoucherDTO[] = null;

	@ApiPropertyOptional({ type: () => BasePaginationResponse })
	meta?: BasePaginationResponse;
}
