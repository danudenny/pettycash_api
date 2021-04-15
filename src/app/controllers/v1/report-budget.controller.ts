import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryReportBudgetDTO } from '../../domain/report-budget/report-budget-query.dto';
import { ReportBudgetsWithPaginationResponse } from '../../domain/report-budget/report-budget-response.dto';
import { ReportBudgetService } from '../../services/v1/report-budget.service';

@ApiTags('Reports Budgets')
@ApiInternalServerErrorResponse({ description: 'General Error' })
@Controller('v1/reports/budgets')
export class ReportBudgetController {

    constructor(
        private readonly reportBudgetService: ReportBudgetService
    ) {}


    @Get()
    @ApiOperation({ summary: 'List all reports down payments' })
    @ApiOkResponse({ type: ReportBudgetsWithPaginationResponse })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async getAllReports(@Query() query: QueryReportBudgetDTO,): Promise<ReportBudgetsWithPaginationResponse> {
        try {
            return this.reportBudgetService.getAllReport(query);
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
