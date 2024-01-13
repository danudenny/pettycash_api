import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiHeader,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { QueryReportAccountDailyClosingDTO } from '../../domain/report-account-daily-closing/summary-query.dto';
import { ReportAccountDailyClosingSummaryResponse } from '../../domain/report-account-daily-closing/summary-response.dto';
import { AccountDailyClosingService } from '../../services/v1/account-daily-closing.service';

@Controller('v1/reports/account-daily-closings')
@ApiTags('Reports Account Daily Closings')
@ApiHeader({ name: 'x-username', description: 'Custom User Request' })
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class ReportAccountDailyClosingController {
  constructor(private svc: AccountDailyClosingService) {}

  @Get('/summary')
  @ApiOperation({ summary: 'Summary report account daily closing' })
  @ApiOkResponse({
    type: ReportAccountDailyClosingSummaryResponse,
    description: 'Successfully get data',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async getSummary(
    @Query() query?: QueryReportAccountDailyClosingDTO,
  ): Promise<ReportAccountDailyClosingSummaryResponse> {
    return this.svc.getSummary(query);
  }
}
