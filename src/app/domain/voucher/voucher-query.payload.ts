import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherState } from '../../../model/utils/enum';

export class QueryVoucherDTO extends BasePayload {
	@ApiPropertyOptional({
		description: 'Expense Start Date',
		example: '2021-01-01',
	})
	startDate__gte: Date;

	@ApiPropertyOptional({
		description: 'Expense End Date',
		example: '2021-12-31',
	})
	endDate__lte: Date;

	@ApiPropertyOptional({
		description: 'Branch ID',
		example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
	})
	branchId: string;

	@ApiPropertyOptional({
		description: 'Employee ID',
		example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
	})
	employeeId: string;

	@ApiPropertyOptional({
		description: 'Expense State',
		example: 'draft',
		enum: VoucherState,
	})
	state: VoucherState;
}
