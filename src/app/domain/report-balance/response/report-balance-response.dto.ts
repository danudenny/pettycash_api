import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../../common/base-response.dto';
import { ReportBalanceDTO } from '../dto/report-balance.dto';
import { ReportBalanceResponseMapper } from '../response-mapper/report-balance-response.mapper.dto';
import { PaginationBuilder } from '../../common/pagination-builder';
import { BasePaginationResponse } from '../../common/base-pagination-response.dto';

export class ReportBalancePaginationResponse extends BaseResponse {
	constructor(data?: Partial<ReportBalanceDTO | ReportBalanceDTO[]>, params?: any) {
		super();
		if (data) {
			this.data = ReportBalanceResponseMapper.fromDTO(data);
			this.meta = PaginationBuilder.build(data, params);
		}
	}

	@ApiPropertyOptional({ type: () => [ReportBalanceDTO] })
	data?: ReportBalanceDTO | ReportBalanceDTO[] = null;

	@ApiPropertyOptional({ type: () => BasePaginationResponse })
	meta?: BasePaginationResponse;
}
