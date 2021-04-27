import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ReportBalanceService } from '../../services/v1/report-balance.service';
import { QueryReportBalanceDTO } from '../../domain/balance/balance.query.dto';
import { BalanceWithPaginationResponse } from '../../domain/balance/response.dto';

@ApiTags('Reports Balance')
@ApiInternalServerErrorResponse({ description: 'General Error' })
@Controller('v1/reports/balance')
export class ReportBalanceController {

	constructor(
		private readonly reportBalanceService: ReportBalanceService
	) {}


	@Get()
	@ApiOperation({ summary: 'List all Report Balance' })
	@ApiOkResponse({ type: BalanceWithPaginationResponse })
	@ApiBadRequestResponse({ description: 'Bad Request' })
	async getAllReports(@Query() query: QueryReportBalanceDTO,): Promise<BalanceWithPaginationResponse> {
		try {
			return await this.reportBalanceService.getBalanceReport(query);
		} catch (err) {
			throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
		}
	}

	@Get('/export')
	@ApiOperation({ summary: 'Exports Balance' })
	@ApiOkResponse({ type: Object })
	@ApiBadRequestResponse({ description: 'Bad Request' })
	async exportReports(@Query() query: Object,) {
		try {
			return null
		} catch (err) {
			throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
		}
	}
}