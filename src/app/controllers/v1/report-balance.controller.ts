import { Response } from 'express';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpException, HttpStatus, Query, Res } from '@nestjs/common';
import { ReportBalanceService } from '../../services/v1/report-balance.service';
import { QueryReportBalanceDTO } from '../../domain/balance/balance.query.dto';
import { ReportBalancePaginationResponse } from '../../domain/report-balance/response/report-balance-response.dto';

@ApiTags('Reports Balance')
@ApiInternalServerErrorResponse({ description: 'General Error' })
@Controller('v1/reports/balance')
export class ReportBalanceController {

	constructor(
		private readonly reportBalanceService: ReportBalanceService
	) {}


	@Get()
	@ApiOperation({ summary: 'List all Report Balance' })
	@ApiOkResponse({ type: ReportBalancePaginationResponse })
	@ApiBadRequestResponse({ description: 'Bad Request' })
	async getAllReports(@Query() query: QueryReportBalanceDTO,): Promise<ReportBalancePaginationResponse> {
		try {
			return await this.reportBalanceService.getBalanceReport(query);
		} catch (err) {
			throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
		}
	}

	@Get('/export')
	@ApiOperation({ summary: 'Exports Balance Report' })
	@ApiOkResponse({ type: Buffer })
	@ApiBadRequestResponse({ description: 'Bad Request' })
	async exportReports(@Res() res: Response) {
		try {
			return this.reportBalanceService.export(res);
		} catch (err) {
			throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
		}
	}
}
