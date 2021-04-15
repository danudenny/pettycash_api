import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryReportDownPaymentDTO } from 'src/app/domain/report-down-payment/report-down-payment-query.dto';
import { ReportDownPaymentsWithPaginationResponse } from 'src/app/domain/report-down-payment/report-down-payment-response.dto';
import { ReportDownPaymentService } from 'src/app/services/v1/report-down-payment.service';

@ApiTags('Reports Budgets')
@ApiInternalServerErrorResponse({ description: 'General Error' })
@Controller('v1/reports/budgets')
export class ReportBudgetController {

    constructor(
        private readonly reportDownPaymentService: ReportDownPaymentService
    ) {}


    @Get()
    @ApiOperation({ summary: 'List all reports down payments' })
    @ApiOkResponse({ type: ReportDownPaymentsWithPaginationResponse })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getAllReports(@Query() query: QueryReportDownPaymentDTO,): Promise<ReportDownPaymentsWithPaginationResponse> {
        try {
            return this.reportDownPaymentService.getAllReport(query);
        } catch (err) {
            throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
        }
    }

    @Get('/export')
    @ApiOperation({ summary: 'Exports down payment' })
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
