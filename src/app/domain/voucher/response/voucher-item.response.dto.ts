import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../common/base-response.dto';
import { VoucherItemResponseMapper } from '../response-mapper/voucher-item.response.mapper.dto';
import { VoucherItemDTO } from '../dto/voucher-item.dto';

export class VoucherItemResponse extends BaseResponse {
	constructor(data?: Partial<VoucherItemDTO | VoucherItemDTO[]>) {
		super();
		if (data) {
			this.data = VoucherItemResponseMapper.fromDTO(data);
		}
	}

	@ApiPropertyOptional({ type: () => VoucherItemDTO })
	data?: VoucherItemDTO | VoucherItemDTO[] = null;
}
