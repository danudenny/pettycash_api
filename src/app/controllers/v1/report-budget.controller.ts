import { Controller, Get, HttpException, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
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
    @ApiOperation({ summary: 'List all reports budget' })
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
    @ApiOperation({ summary: 'Exports Report Budget' })
    @ApiOkResponse({ type: Buffer })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async exportReports(@Res() res: Response , @Query() query: QueryReportBudgetDTO,): Promise<Buffer>{
        try {
            return this.reportBudgetService.export(res, query)
        } catch (err) {
            throw new HttpException( err.message, err.status || HttpStatus.BAD_REQUEST,);
        }
    }
}
