import { ApiPropertyOptional } from '@nestjs/swagger';
import { Voucher } from '../../../../model/voucher.entity';
import { VoucherDetailDTO } from '../dto/voucher-detail.dto';
import { BaseResponse } from '../../common/base-response.dto';
import { VoucherDetailResponseMapper } from '../response-mapper/voucher-detail.response.mapper.dto';

export class VoucherDetailResponse extends BaseResponse {
	constructor(data?: Partial<Voucher>) {
		super();
		if (data) {
			this.data = VoucherDetailResponseMapper.fromEntity(data);
		}
	}

	@ApiPropertyOptional({ type: () => VoucherDetailDTO })
	data?: VoucherDetailDTO = null;
}
