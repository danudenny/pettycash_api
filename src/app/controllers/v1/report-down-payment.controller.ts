import { Response } from 'express';
import { Controller, Get, HttpException, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryReportDownPaymentDTO } from 'src/app/domain/report-down-payment/report-down-payment-query.dto';
import { ReportDownPaymentsWithPaginationResponse } from 'src/app/domain/report-down-payment/report-down-payment-response.dto';
import { ReportDownPaymentService } from 'src/app/services/v1/report-down-payment.service';

@ApiTags('Reports Down Payments')
@ApiInternalServerErrorResponse({ description: 'General Error' })
@Controller('v1/reports/down-payments')
export class ReportDownPaymentController {

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
    @ApiOperation({ summary: 'Exports report down payment' })
    @ApiOkResponse({ type: Buffer })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async exportReports(@Res() res: Response , @Query() query: QueryReportDownPaymentDTO,): Promise<Buffer>{
        try {
            return this.reportDownPaymentService.export(res, query)
        } catch (err) {
            throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
        }
    }
}
