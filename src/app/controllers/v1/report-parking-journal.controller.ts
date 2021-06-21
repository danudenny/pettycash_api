import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiHeader,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ReportParkingJournalService } from '../../services/v1/report-parking-journal.service';

@Controller('v1/reports/parking-journals')
@ApiTags('Reports Parking Journals')
@ApiHeader({ name: 'x-username', description: 'Custom User Request' })
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class ReportParkingJournalController {
  constructor(private svc: ReportParkingJournalService) {}

  @Get()
  @ApiOperation({ summary: 'List all parking journal' })
  @ApiOkResponse({ description: 'Successfully get data' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: any): Promise<any> {
    return this.svc.list(query);
  }

  @Get('/export')
  @ApiOperation({ summary: 'Export all parking journal to csv' })
  @ApiOkResponse({ description: 'Successfully get data' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async export(@Query() query: any): Promise<any> {
    return this.svc.export(query);
  }
}
